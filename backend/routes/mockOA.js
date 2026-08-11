import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  generateMockOA,
  submitMockOA,
  getMockOA
} from "../controllers/mockOAController.js";

const router = express.Router();

router.post("/generate", authMiddleware, generateMockOA);
router.post("/:id/submit", authMiddleware, submitMockOA);
router.get("/:id", authMiddleware, getMockOA);

export default router;