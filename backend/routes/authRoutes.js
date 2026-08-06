import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import  protect  from "../middleware/auth.js";
import uploadResume from "../middleware/uploadResume.js";

import {
    signup,
    login,
    getProfile,
    updateRoadmapTask,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/profile", protect, getProfile);

router.patch("/roadmap-task", protect, updateRoadmapTask);
router.patch("/skills", protect, async (req, res) => {
  const { skills } = req.body;
  if (!Array.isArray(skills)) {
    return res.status(400).json({ message: "skills must be an array of strings" });
  }
  const user = await User.findById(req.user._id);
  user.skillProfile.known = skills;
  await user.save();
  res.json(user.skillProfile);
});


router.post("/resume", protect, uploadResume.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Resume PDF is required (field name: resume)" });

  const user = await User.findById(req.user._id);
  user.resume = {
    filename: req.file.originalname,
    path: `/uploads/resumes/${req.file.filename}`,
    uploadedAt: new Date()
  };
  await user.save();
  res.json(user.resume);
});

export default router;