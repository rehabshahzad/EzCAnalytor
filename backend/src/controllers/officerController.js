const Officer = require("../models/Officer");
const User = require("../models/User");
const { CRIME_TYPE_TO_DEPARTMENTS } = require("../utils/crimeConstants");

const generateBadgeNumber = async () => {
  let badge, exists;
  do {
    const num = Math.floor(1000 + Math.random() * 9000);
    badge = `PK-${num}`;
    exists = await Officer.findOne({ badgeNumber: badge });
  } while (exists);
  return badge;
};

const generateOfficerEmail = (name, badgeNumber) => {
  const slug = name.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "");
  const suffix = badgeNumber.replace("PK-", "").toLowerCase();
  return `${slug}.${suffix}@police.gov.pk`;
};

// Admin registers an officer — city is inherited from the admin's own city
const createOfficer = async (req, res) => {
  try {
    const { name, department } = req.body;

    if (!name || !department) {
      return res.status(400).json({ success: false, message: "Name and department are required" });
    }

    // Pull admin's city from the authenticated user
    const adminCity = req.user.city;
    if (!adminCity) {
      return res.status(400).json({ success: false, message: "Your admin account has no city assigned. Please contact a super-admin." });
    }

    const badgeNumber = await generateBadgeNumber();
    const email = generateOfficerEmail(name, badgeNumber);

    const emailTaken = await Officer.findOne({ email });
    if (emailTaken) {
      return res.status(400).json({ success: false, message: "Generated email conflict — please retry" });
    }

    const officer = new Officer({ name, department, badgeNumber, email, city: adminCity, assignedCases: 0 });
    const saved = await officer.save();

    res.status(201).json({ success: true, message: "Officer registered successfully", data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create officer", error: error.message });
  }
};

// Admin only sees officers from their own city
const getAllOfficers = async (req, res) => {
  try {
    const filter = req.user.city ? { city: req.user.city } : {};

    if (req.query.available === "true") {
      filter.assignedCases = 0;
    }

    if (req.query.crimeType) {
      const allowedDepartments = CRIME_TYPE_TO_DEPARTMENTS[req.query.crimeType] || [];
      filter.department = { $in: allowedDepartments };
    }

    const officers = await Officer.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: officers.length, data: officers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch officers", error: error.message });
  }
};

const getOfficerById = async (req, res) => {
  try {
    const officer = await Officer.findById(req.params.id);
    if (!officer) return res.status(404).json({ success: false, message: "Officer not found" });

    // Admins can only view officers from their own city
    if (req.user.city && officer.city !== req.user.city) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: officer });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch officer", error: error.message });
  }
};

const updateOfficer = async (req, res) => {
  try {
    const { badgeNumber, email, city, ...safeFields } = req.body; // city also blocked from manual override

    const existing = await Officer.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Officer not found" });

    if (req.user.city && existing.city !== req.user.city) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const updated = await Officer.findByIdAndUpdate(req.params.id, safeFields, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: "Officer updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update officer", error: error.message });
  }
};

const deleteOfficer = async (req, res) => {
  try {
    const existing = await Officer.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Officer not found" });

    if (req.user.city && existing.city !== req.user.city) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const deleted = await Officer.findByIdAndDelete(req.params.id);
    if (deleted.userId) await User.findByIdAndDelete(deleted.userId);

    res.status(200).json({ success: true, message: "Officer deleted", data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete officer", error: error.message });
  }
};

module.exports = { createOfficer, getAllOfficers, getOfficerById, updateOfficer, deleteOfficer };