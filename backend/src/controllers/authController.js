const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Officer = require("../models/Officer");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// ─── REGISTER (users only) ───────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword, role: "user" });
    const saved = await newUser.save();
    const token = generateToken(saved);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      data: { _id: saved._id, name: saved.name, email: saved.email, role: saved.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Registration failed", error: error.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password, badgeNumber, role: loginRole } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // ── Officer login: authenticate against the Officer collection ──
    if (loginRole === "officer") {
      if (!badgeNumber) {
        return res.status(400).json({ success: false, message: "Badge number is required" });
      }

      const officer = await Officer.findOne({ email, badgeNumber });
      if (!officer) {
        return res.status(401).json({ success: false, message: "Invalid email or badge number" });
      }

      // Find or create the linked User record so JWT works normally
      let user = await User.findOne({ email });
      if (!user) {
        // First-time login: create a shadow user for the officer
        user = new User({ name: officer.name, email, password: null, role: "officer", badgeNumber: officer.badgeNumber });
        await user.save();
        officer.userId = user._id;
        await officer.save();
      }

      const token = generateToken(user);
      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        data: { _id: user._id, name: user.name, email: user.email, role: "officer", badgeNumber: officer.badgeNumber }
      });
    }

    // ── Admin / User login: authenticate against the User collection ──
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (loginRole === "admin" && user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: { _id: user._id, name: user.name, email: user.email, role: user.role, badgeNumber: user.badgeNumber }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
};

// ─── PROFILE ──────────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Attach badge number from Officer record if officer
    let data = user.toObject();
    if (user.role === "officer") {
      const officer = await Officer.findOne({ userId: user._id });
      if (officer) data.badgeNumber = officer.badgeNumber;
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch profile", error: error.message });
  }
};

module.exports = { registerUser, loginUser, getProfile };
