const mongoose = require("mongoose");

const crimeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    crimeType: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    area: {
      type: String,
      required: true,
      trim: true
    },
    incidentDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["open", "investigating", "resolved"],
      default: "open"
    },
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Officer",
      default: null
    }
  },
  {
    timestamps: true
  }
);

crimeSchema.index({ city: 1 });
crimeSchema.index({ crimeType: 1 });
crimeSchema.index({ incidentDate: 1 });
crimeSchema.index({ status: 1 });
crimeSchema.index({ officer: 1 });
crimeSchema.index({ city: 1, crimeType: 1, incidentDate: -1 });

const Crime = mongoose.model("Crime", crimeSchema);

module.exports = Crime;