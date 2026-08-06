import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Application from "../models/Application.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });


export const signup = async (req, res) => {
  try {
   const {
  name,
  email,
  password,
  branch,
  semester,
} = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      branch,
      semester,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      branch: user.branch,
      semester: user.semester,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Signup Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};



export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
    });

    if (
      user &&
      (await user.matchPassword(password))
    ) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        semester: user.semester,
        resume: user.resume,
        token: generateToken(user._id),
      });
    }

    res.status(401).json({
      message: "Invalid email or password",
    });
  } catch (err) {
    console.error("Login Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};



export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Get all applications of the user
    const applications = await Application.find({
      user: req.user._id,
    });

    const stats = {
      applied: applications.filter((app) =>
        ["applied", "oa", "interview", "result_awaited"].includes(app.status)
      ).length,

      notApplied: applications.filter(
        (app) => app.status === "not_applied"
      ).length,

      selected: applications.filter(
        (app) => app.status === "selected"
      ).length,

      rejected: applications.filter(
        (app) => app.status === "rejected"
      ).length,
    };

    res.json({
      _id: user._id,

      name: user.name,

      email: user.email,

      branch: user.branch,

      semester: user.semester,

      streak: user.streak,

      resume: user.resume,

      resumeMatchScore: user.resumeMatchScore,

      skillProfile: user.skillProfile,

      stats,
    });
  } catch (err) {
    console.error("Profile Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


export const updateRoadmapTask = async (
  req,
  res
) => {
  try {
    const { day, done } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const task =
      user.skillProfile?.roadmap?.find(
        (item) => item.day === day
      );

    if (!task) {
      return res.status(404).json({
        message: "Roadmap task not found",
      });
    }

    task.done = done;

    await user.save();

    res.json(user.skillProfile);
  } catch (err) {
    console.error("Roadmap Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};