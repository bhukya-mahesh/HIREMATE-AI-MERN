import express from "express";
import Application from "../models/Application.js";
import  protect  from "../middleware/auth.js";

const router = express.Router();
router.use(protect); 

router.get("/", async (req, res) => {
  const apps = await Application.find({ user: req.user._id }).sort({ deadline: 1 });
  res.json(apps);
});


router.post("/", async (req, res) => {
  try {
    const app = await Application.create({ ...req.body, user: req.user._id });
    res.status(201).json(app);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.patch("/:id", async (req, res) => {
  const app = await Application.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );
  if (!app) return res.status(404).json({ message: "Application not found" });
  res.json(app);
});


router.delete("/:id", async (req, res) => {
  const app = await Application.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!app) return res.status(404).json({ message: "Application not found" });
  res.json({ message: "Deleted" });
});


router.patch("/:id/mark-applied", async (req, res) => {
  const app = await Application.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { status: "applied" },
    { new: true }
  );
  if (!app) return res.status(404).json({ message: "Application not found" });
  res.json(app);
});

export default router;
