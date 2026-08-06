import Application from "../models/Application.js";

export const getApplications = async (req, res) => {
  try {
    const apps = await Application.find({
      user: req.user._id,
    }).sort({ deadline: 1 });

    res.json(apps);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const createApplication = async (req, res) => {
  try {
    const app = await Application.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json(app);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const updateApplication = async (req, res) => {
  try {
    const app = await Application.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      req.body,
      {
        new: true,
      }
    );

    if (!app)
      return res.status(404).json({
        message: "Application not found",
      });

    res.json(app);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const app = await Application.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!app)
      return res.status(404).json({
        message: "Application not found",
      });

    res.json({
      message: "Deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const markApplied = async (req, res) => {
  try {
    const app = await Application.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        status: "applied",
      },
      {
        new: true,
      }
    );

    if (!app)
      return res.status(404).json({
        message: "Application not found",
      });

    res.json(app);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};