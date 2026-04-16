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
router.post("/", protect, authorizeRoles("admin"), createCrime);

router.put("/:id", protect, authorizeRoles("admin", "officer"), updateCrime);

router.delete("/:id", protect, authorizeRoles("admin"), deleteCrime);

router.post("/assign", protect, authorizeRoles("admin"), assignCrimeToOfficer);

router.post("/", createCrime);
router.get("/", getAllCrimes);

router.get("/stats/city", getCrimesByCity);
router.get("/stats/type", getCrimesByType);
router.get("/stats/trends", getCrimeTrends);

router.post("/assign", assignCrimeToOfficer);

router.get("/:id", getCrimeById);
router.put("/:id", updateCrime);
router.delete("/:id", deleteCrime);

module.exports = router;