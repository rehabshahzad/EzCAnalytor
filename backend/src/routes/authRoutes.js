const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  changePassword
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);
router.patch("/change-password", protect, changePassword);

module.exports = router;