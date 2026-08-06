import express from "express";
import protect from "../middleware/auth.js";

import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  markApplied,
} from "../controllers/applicationController.js";

const router = express.Router();

router.use(protect);

router.get("/", getApplications);

router.post("/", createApplication);

router.patch("/:id", updateApplication);

router.delete("/:id", deleteApplication);

router.patch("/:id/mark-applied", markApplied);

export default router;