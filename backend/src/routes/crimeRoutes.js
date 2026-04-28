const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createCrime,
  getAllCrimes,
  getCrimeById,
  updateCrime,
  deleteCrime,
  getCrimesByCity,
  getCrimesByType,
  getCrimeTrends,
  assignCrimeToOfficer
} = require("../controllers/crimeController");

// Stats — public (used on dashboard by all roles including plain users)
router.get("/stats/city",   getCrimesByCity);
router.get("/stats/type",   getCrimesByType);
router.get("/stats/trends", getCrimeTrends);

// Assign — admin only
router.post("/assign", protect, authorizeRoles("admin"), assignCrimeToOfficer);

// Create — admin only
router.post("/", protect, authorizeRoles("admin"), createCrime);

// List + detail — officer and admin only (plain users cannot browse crimes)
router.get("/",    protect, authorizeRoles("admin", "officer"), getAllCrimes);
router.get("/:id", protect, authorizeRoles("admin", "officer"), getCrimeById);

// Edit — admin only (officers are read-only)
router.put("/:id", protect, authorizeRoles("admin"), updateCrime);

// Delete — admin only
router.delete("/:id", protect, authorizeRoles("admin"), deleteCrime);

module.exports = router;
