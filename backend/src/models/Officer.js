const mongoose = require("mongoose");

const officerSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    badgeNumber:  { type: String, required: true, unique: true },
    department:   { type: String, required: true },
    assignedCases:{ type: Number, default: 0 },
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

const Officer = mongoose.models.Officer || mongoose.model("Officer", officerSchema);
module.exports = Officer;
