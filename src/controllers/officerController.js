const Officer = require("../models/Officer");

const createOfficer = async (req, res) => {
  try {
    const { name, badgeNumber, department } = req.body;

    const newOfficer = new Officer({
      name,
      badgeNumber,
      department
    });

    const savedOfficer = await newOfficer.save();

    res.status(201).json({
      success: true,
      message: "Officer created successfully",
      data: savedOfficer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create officer",
      error: error.message
    });
  }
};

const getAllOfficers = async (req, res) => {
  try {
    const officers = await Officer.find();

    res.status(200).json({
      success: true,
      count: officers.length,
      data: officers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch officers",
      error: error.message
    });
  }
};

const getOfficerById = async (req, res) => {
  try {
    const officer = await Officer.findById(req.params.id);

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer not found"
      });
    }

    res.status(200).json({
      success: true,
      data: officer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch officer",
      error: error.message
    });
  }
};

const updateOfficer = async (req, res) => {
  try {
    const updatedOfficer = await Officer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedOfficer) {
      return res.status(404).json({
        success: false,
        message: "Officer not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Officer updated successfully",
      data: updatedOfficer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update officer",
      error: error.message
    });
  }
};

const deleteOfficer = async (req, res) => {
  try {
    const deletedOfficer = await Officer.findByIdAndDelete(req.params.id);

    if (!deletedOfficer) {
      return res.status(404).json({
        success: false,
        message: "Officer not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Officer deleted successfully",
      data: deletedOfficer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete officer",
      error: error.message
    });
  }
};

module.exports = {
  createOfficer,
  getAllOfficers,
  getOfficerById,
  updateOfficer,
  deleteOfficer
};