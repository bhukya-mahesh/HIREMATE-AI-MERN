import express from "express";
import protect from "../middleware/auth.js";
import upload from "../middleware/upload.js";

import {
  analyzeJD,
  analyzeResume,
  generateRoadmap,
  getMentorMessage,
} from "../controllers/aiController.js";

const router = express.Router();

router.use(protect);

router.post(
  "/applications/:id/analyze-jd",
  upload.single("jd"),
  analyzeJD
);

router.post(
  "/applications/:id/analyze-resume",
  upload.single("resume"),
  analyzeResume
);


router.post("/applications/:id/roadmap", generateRoadmap);

router.get("/mentor-message", getMentorMessage);

export default router;
