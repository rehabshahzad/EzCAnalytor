const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "user"
    });

    const savedUser = await newUser.save();
    const token = generateToken(savedUser);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      data: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: error.message
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, role: loginRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    if (loginRole === "admin") {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      const token = generateToken({ _id: admin._id, role: "admin" });
      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        data: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: "admin",
          city: admin.city
        }
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to login user",
      error: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    let data;
    if (req.user.role === "admin") {
      const admin = await Admin.findById(req.user.id).select("-password");
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found"
        });
      }
      data = admin.toObject();
      data.role = "admin";
    } else {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      data = user.toObject();
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile
};