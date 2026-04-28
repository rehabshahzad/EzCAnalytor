const mongoose = require("mongoose");
const Crime = require("../models/Crime");
const Officer = require("../models/Officer");

const createCrime = async (req, res) => {
  try {
    const { title, description, crimeType, city, area, incidentDate, status, officer } = req.body;

    const newCrime = new Crime({
      title, description, crimeType, city, area, incidentDate, status,
      officer: officer || null
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
  try {
    const updatedCrime = await Crime.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    ).populate("officer", "name badgeNumber department assignedCases");

    if (!updatedCrime) {
      return res.status(404).json({ success: false, message: "Crime report not found" });
    }

    res.status(200).json({ success: true, message: "Crime report updated successfully", data: updatedCrime });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update crime report", error: error.message });
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

module.exports = {
  createCrime, getAllCrimes, getCrimeById, updateCrime,
  deleteCrime, getCrimesByCity, getCrimesByType, getCrimeTrends, assignCrimeToOfficer
};
