const mongoose = require("mongoose");
const Crime = require("../models/Crime");
const Officer = require("../models/Officer");
const { CRIME_TYPE_TO_DEPARTMENTS } = require("../utils/crimeConstants");

const createCrime = async (req, res) => {
  try {
    const { title, description, crimeType, area, incidentDate, status, officer } = req.body;
    const imagePaths = (req.files || []).map((file) => `/uploads/${file.filename}`);

    // City is always taken from the logged-in admin's profile — never from the form
    const city = req.user.city;
    if (!city) {
      return res.status(400).json({ success: false, message: "Your admin account has no city assigned." });
    }

    if (officer) {
      const assignedOfficer = await Officer.findById(officer);
      if (!assignedOfficer) {
        return res.status(400).json({ success: false, message: "Officer not found" });
      }

      const allowedDepartments = CRIME_TYPE_TO_DEPARTMENTS[crimeType] || [];
      if (!allowedDepartments.includes(assignedOfficer.department)) {
        return res.status(400).json({
          success: false,
          message: `Officer department must match crime type ${crimeType}`
        });
      }
    }

    const newCrime = new Crime({
      title, description, crimeType, city, area, incidentDate, status,
      officer: officer || null,
      images: imagePaths
    });

    const savedCrime = await newCrime.save();
    const populatedCrime = await Crime.findById(savedCrime._id)
      .populate("officer", "name badgeNumber department assignedCases");

    res.status(201).json({ success: true, message: "Crime report created successfully", data: populatedCrime });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create crime report", error: error.message });
  }
};

const getAllCrimes = async (req, res) => {
  try {
    const {
      city, crimeType, status, area, officer,
      startDate, endDate, search, page = 1, limit = 10
    } = req.query;

    const filters = {};
if (req.user.role === "admin" && req.user.city) {
  filters.city = req.user.city;
}

    if (city)      filters.city      = city;
    if (crimeType) filters.crimeType = crimeType;
    if (status)    filters.status    = status;
    if (area)      filters.area      = area;
    if (officer)   filters.officer   = officer;

    if (startDate || endDate) {
      filters.incidentDate = {};
      if (startDate) filters.incidentDate.$gte = new Date(startDate);
      if (endDate)   filters.incidentDate.$lte = new Date(endDate);
    }

    if (search) {
      filters.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { crimeType:   { $regex: search, $options: "i" } },
        { city:        { $regex: search, $options: "i" } },
        { area:        { $regex: search, $options: "i" } }
      ];
    }

    // Officers only see crimes assigned to them
    if (req.user && req.user.role === "officer") {
      const officerDoc = await Officer.findOne({ userId: req.user.id });
      if (!officerDoc) {
        return res.status(200).json({
          success: true, count: 0, total: 0,
          currentPage: 1, totalPages: 0, data: []
        });
      }
      filters.officer = officerDoc._id;
    }

    const pageNumber  = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip        = (pageNumber - 1) * limitNumber;

    const total  = await Crime.countDocuments(filters);
    const crimes = await Crime.find(filters)
      .populate("officer", "name badgeNumber department assignedCases")
      .sort({ incidentDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      count: crimes.length,
      total,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      data: crimes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch crime reports", error: error.message });
  }
};

const getCrimeById = async (req, res) => {
  try {
    const crime = await Crime.findById(req.params.id)
      .populate("officer", "name badgeNumber department assignedCases");

    if (!crime) {
      return res.status(404).json({ success: false, message: "Crime report not found" });
    }

    res.status(200).json({ success: true, data: crime });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch crime report", error: error.message });
  }
};

const updateCrime = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const crime = await Crime.findById(req.params.id).session(session);
    if (!crime) {
      throw new Error("Crime report not found");
    }

    const previousOfficerId = crime.officer ? crime.officer.toString() : null;
    const previousStatus = crime.status;

    const updates = { ...req.body };
    const newOfficerId = updates.officer ? updates.officer.toString() : previousOfficerId;
    const newStatus = updates.status || previousStatus;
    const appliedCrimeType = updates.crimeType || crime.crimeType;
    const newImagePaths = (req.files || []).map((file) => `/uploads/${file.filename}`);

    if (newImagePaths.length) {
      updates.images = [...(crime.images || []), ...newImagePaths];
    }

    if (newOfficerId) {
      const validationOfficer = await Officer.findById(newOfficerId).session(session);
      if (!validationOfficer) {
        throw new Error("Officer not found");
      }

      const allowedDepartments = CRIME_TYPE_TO_DEPARTMENTS[appliedCrimeType] || [];
      if (!allowedDepartments.includes(validationOfficer.department)) {
        throw new Error("Officer department does not match the selected crime type");
      }
    }

    if (!newOfficerId && updates.crimeType && previousOfficerId) {
      const currentOfficer = await Officer.findById(previousOfficerId).session(session);
      if (currentOfficer) {
        const allowedDepartments = CRIME_TYPE_TO_DEPARTMENTS[appliedCrimeType] || [];
        if (!allowedDepartments.includes(currentOfficer.department)) {
          throw new Error("Existing assigned officer does not match the updated crime type");
        }
      }
    }

    // Decrement previous officer count when the crime is no longer active
    const wasActive = ["open", "investigating"].includes(previousStatus);
    const willBeActive = ["open", "investigating"].includes(newStatus);

    if (previousOfficerId && previousOfficerId !== newOfficerId && wasActive) {
      const prevOfficer = await Officer.findById(previousOfficerId).session(session);
      if (prevOfficer && prevOfficer.assignedCases > 0) {
        prevOfficer.assignedCases -= 1;
        await prevOfficer.save({ session });
      }
    }

    if (previousOfficerId && previousOfficerId === newOfficerId && previousOfficerId && previousStatus !== newStatus) {
      const officer = await Officer.findById(previousOfficerId).session(session);
      if (officer) {
        if (wasActive && !willBeActive && officer.assignedCases > 0) {
          officer.assignedCases -= 1;
          await officer.save({ session });
        } else if (!wasActive && willBeActive) {
          officer.assignedCases += 1;
          await officer.save({ session });
        }
      }
    }

    if (newOfficerId && newOfficerId !== previousOfficerId && willBeActive) {
      const newOfficer = await Officer.findById(newOfficerId).session(session);
      if (!newOfficer) {
        throw new Error("Officer not found");
      }
      newOfficer.assignedCases += 1;
      await newOfficer.save({ session });
    }

    Object.assign(crime, updates);
    await crime.save({ session });

    await session.commitTransaction();
    session.endSession();

    const updatedCrime = await Crime.findById(req.params.id)
      .populate("officer", "name badgeNumber department assignedCases");

    res.status(200).json({ success: true, message: "Crime report updated successfully", data: updatedCrime });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    const statusCode = error.message === "Crime report not found" ? 404 : 500;
    res.status(statusCode).json({ success: false, message: error.message || "Failed to update crime report", error: error.message });
  }
};

const deleteCrime = async (req, res) => {
  try {
    const deletedCrime = await Crime.findByIdAndDelete(req.params.id);

    if (!deletedCrime) {
      return res.status(404).json({ success: false, message: "Crime report not found" });
    }

    res.status(200).json({ success: true, message: "Crime report deleted successfully", data: deletedCrime });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete crime report", error: error.message });
  }
};

const getCrimesByCity = async (req, res) => {
  try {
    const stats = await Crime.aggregate([
      { $group: { _id: "$city", totalCrimes: { $sum: 1 } } },
      { $sort: { totalCrimes: -1 } }
    ]);
    res.status(200).json({ success: true, count: stats.length, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch city-wise crime stats", error: error.message });
  }
};

const getCrimesByType = async (req, res) => {
  try {
    const stats = await Crime.aggregate([
      { $group: { _id: "$crimeType", totalCrimes: { $sum: 1 } } },
      { $sort: { totalCrimes: -1 } }
    ]);
    res.status(200).json({ success: true, count: stats.length, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch crime type stats", error: error.message });
  }
};

const getCrimeTrends = async (req, res) => {
  try {
    const stats = await Crime.aggregate([
      {
        $group: {
          _id: { year: { $year: "$incidentDate" }, month: { $month: "$incidentDate" } },
          totalCrimes: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    res.status(200).json({ success: true, count: stats.length, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch crime trends", error: error.message });
  }
};

const assignCrimeToOfficer = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { crimeId, officerId } = req.body;
    if (!crimeId || !officerId) throw new Error("crimeId and officerId are required");

    const crime = await Crime.findById(crimeId).session(session);
    if (!crime) throw new Error("Crime not found");

    const officer = await Officer.findById(officerId).session(session);
    if (!officer) throw new Error("Officer not found");
    if (req.user.city && officer.city !== req.user.city) {
      throw new Error("Cannot assign a crime to an officer from a different city");
    }

    const allowedDepartments = CRIME_TYPE_TO_DEPARTMENTS[crime.crimeType] || [];
    if (!allowedDepartments.includes(officer.department)) {
      throw new Error("Officer department does not match this crime type");
    }

    if (officer.assignedCases > 0 && (!crime.officer || crime.officer.toString() !== officerId)) {
      throw new Error("Officer is already assigned to an active case and cannot take another until it is resolved");
    }

    if (crime.officer && crime.officer.toString() === officerId) {
      throw new Error("Crime is already assigned to this officer");
    }

    if (crime.officer) {
      const prevOfficer = await Officer.findById(crime.officer).session(session);
      if (prevOfficer) {
        prevOfficer.assignedCases -= 1;
        await prevOfficer.save({ session });
      }
    }

    crime.officer = officerId;
    await crime.save({ session });

    officer.assignedCases += 1;
    await officer.save({ session });

    await session.commitTransaction();
    session.endSession();

    const updatedCrime = await Crime.findById(crimeId)
      .populate("officer", "name badgeNumber department assignedCases");

    res.status(200).json({ success: true, message: "Crime assigned to officer successfully", data: updatedCrime });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: "Transaction failed", error: error.message });
  }
};


const getCrimesByArea = async (req, res) => {
  try {
    const { city } = req.query;
    const matchStage = city ? { $match: { city } } : null;

    const pipeline = [
      ...(matchStage ? [matchStage] : []),
      {
        $group: {
          _id: { city: "$city", area: "$area" },
          totalCrimes: { $sum: 1 }
        }
      },
      { $sort: { totalCrimes: -1 } },
      {
        $group: {
          _id: "$_id.city",
          areas: {
            $push: { area: "$_id.area", totalCrimes: "$totalCrimes" }
          },
          totalCrimes: { $sum: "$totalCrimes" }
        }
      },
      { $sort: { totalCrimes: -1 } }
    ];

    const stats = await Crime.aggregate(pipeline);
    res.status(200).json({ success: true, count: stats.length, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch area-wise crime stats", error: error.message });
  }
};

module.exports = {
  createCrime, getAllCrimes, getCrimeById, updateCrime,
  deleteCrime, getCrimesByCity, getCrimesByType, getCrimeTrends,
  getCrimesByArea, assignCrimeToOfficer
};
