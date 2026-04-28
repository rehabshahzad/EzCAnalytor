const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    email:       { type: String, required: true, unique: true, trim: true, lowercase: true },
    password:    { type: String, default: null },   // null for officer shadow accounts
    role:        { type: String, enum: ["admin", "officer", "user"], default: "user" },
    badgeNumber: { type: String, unique: true, sparse: true, default: null }
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
