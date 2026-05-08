const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userRole = decoded.role;

    if (userRole === "admin") {
      const admin = await Admin.findById(decoded.id).select("city");
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Admin no longer exists"
        });
      }

      req.user = {
        id: decoded.id,
        role: "admin",
        city: admin.city || null
      };
    } else {
      const user = await User.findById(decoded.id).select("role city");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User no longer exists"
        });
      }

      req.user = {
        id: decoded.id,
        role: user.role,
        city: user.city || null
      };
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid token"
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorizeRoles
};