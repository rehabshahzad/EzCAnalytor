const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
// CHANGE the destructured import at the top to include getCrimesByArea:
const {
  createCrime,
  getAllCrimes,
  getCrimeById,
  updateCrime,
  deleteCrime,
  getCrimesByCity,
  getCrimesByType,
  getCrimeTrends,
  getCrimesByArea,       
  assignCrimeToOfficer
} = require("../controllers/crimeController");

const uploadDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-.]/g, "");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});


// Stats — public (used on dashboard by all roles including plain users)
router.get("/stats/city",   getCrimesByCity);
router.get("/stats/type",   getCrimesByType);
router.get("/stats/trends", getCrimeTrends);
router.get("/stats/area", getCrimesByArea);

// Assign — admin only
router.post("/assign", protect, authorizeRoles("admin"), assignCrimeToOfficer);

// Create — admin only
router.post("/", protect, authorizeRoles("admin"), upload.array("images", 5), createCrime);

// Edit — admin only (support adding more images)
router.put("/:id", protect, authorizeRoles("admin"), upload.array("images", 5), updateCrime);

// List + detail — officer and admin only (plain users cannot browse crimes)
router.get("/",    protect, authorizeRoles("admin", "officer"), getAllCrimes);
router.get("/:id", protect, authorizeRoles("admin", "officer"), getCrimeById);

// Edit — admin only (officers are read-only)
router.put("/:id", protect, authorizeRoles("admin"), updateCrime);

// Delete — admin only
router.delete("/:id", protect, authorizeRoles("admin"), deleteCrime);

module.exports = router;
