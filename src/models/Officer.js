const mongoose = require("mongoose");

const officerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    badgeNumber: {
      type: String,
      required: true,
      unique: true
    },
    department: {
      type: String,
      required: true
    },
    assignedCases: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Officer = mongoose.model("Officer", officerSchema);

module.exports = Officer;