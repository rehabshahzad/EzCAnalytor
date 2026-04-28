const Officer = require("../models/Officer");
const User = require("../models/User");

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Controllers ───────────────────────────────────────────────────────────────

// Admin registers an officer — email & badge auto-generated, stored in officers collection
const createOfficer = async (req, res) => {
  try {
    const { name, department } = req.body;

    if (!name || !department) {
      return res.status(400).json({ success: false, message: "Name and department are required" });
    }

    const badgeNumber = await generateBadgeNumber();
    const email = generateOfficerEmail(name, badgeNumber);

    // Make sure the generated email isn't already taken (extremely unlikely but safe)
    const emailTaken = await Officer.findOne({ email });
    if (emailTaken) {
      return res.status(400).json({ success: false, message: "Generated email conflict — please retry" });
    }

    const officer = new Officer({ name, department, badgeNumber, email, assignedCases: 0 });
    const saved = await officer.save();

    res.status(201).json({
      success: true,
      message: "Officer registered successfully",
      data: saved
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create officer", error: error.message });
  }
};

// Returns all officers from the Officer collection
const getAllOfficers = async (req, res) => {
  try {
    const officers = await Officer.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: officers.length, data: officers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch officers", error: error.message });
  }
};

const getOfficerById = async (req, res) => {
  try {
    const officer = await Officer.findById(req.params.id);
    if (!officer) return res.status(404).json({ success: false, message: "Officer not found" });
    res.status(200).json({ success: true, data: officer });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch officer", error: error.message });
  }
};

const updateOfficer = async (req, res) => {
  try {
    // Don't allow overwriting auto-generated badge or email
    const { badgeNumber, email, ...safeFields } = req.body;

    const updated = await Officer.findByIdAndUpdate(req.params.id, safeFields, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: "Officer not found" });

    res.status(200).json({ success: true, message: "Officer updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update officer", error: error.message });
  }
};

const deleteOfficer = async (req, res) => {
  try {
    const deleted = await Officer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Officer not found" });

    // Also remove any linked shadow user
    if (deleted.userId) await User.findByIdAndDelete(deleted.userId);

    res.status(200).json({ success: true, message: "Officer deleted", data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete officer", error: error.message });
  }
};

module.exports = { createOfficer, getAllOfficers, getOfficerById, updateOfficer, deleteOfficer };
