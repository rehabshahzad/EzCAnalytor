const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const {
  createOfficer,
  getAllOfficers,
  getOfficerById,
  updateOfficer,
  deleteOfficer
} = require("../controllers/officerController");

// All officer routes are admin-only — officers and users have no access
router.get("/",    protect, authorizeRoles("admin"), getAllOfficers);
router.get("/:id", protect, authorizeRoles("admin"), getOfficerById);
router.post("/",   protect, authorizeRoles("admin"), createOfficer);
router.put("/:id", protect, authorizeRoles("admin"), updateOfficer);
router.delete("/:id", protect, authorizeRoles("admin"), deleteOfficer);

module.exports = router;
