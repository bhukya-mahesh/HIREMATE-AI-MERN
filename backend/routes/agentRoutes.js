import express from "express";
import protect from "../middleware/auth.js";
import { runPrepAgent } from "../controllers/agentController.js";

const router = express.Router();

router.use(protect);

router.post("/prep", runPrepAgent);

export default router;