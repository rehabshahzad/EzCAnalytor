const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    email:       { type: String, required: true, unique: true, trim: true, lowercase: true },
    password:    { type: String, default: null },
    role:        { type: String, enum: ["officer", "user"], default: "user" },
    badgeNumber: { type: String, unique: true, sparse: true, default: null },
    badgeNumber: { type: String, unique: true, sparse: true, default: null },
    city:        { type: String, default: null, trim: true }   // ← ADD THIS LINE
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;