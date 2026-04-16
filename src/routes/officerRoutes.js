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

router.post("/", protect, authorizeRoles("admin"), createOfficer);
router.get("/", getAllOfficers);
router.get("/:id", getOfficerById);
router.put("/:id", protect, authorizeRoles("admin"), updateOfficer);
router.delete("/:id", protect, authorizeRoles("admin"), deleteOfficer);

module.exports = router;