import express from "express";
import protect from "../middleware/auth.js";
import uploadVisits from "../middleware/uploadVisits.js";
import {
  uploadVisitList,
  listVisits,
  getVisit,
  deleteVisit,
} from "../controllers/companyVisitController.js";

const router = express.Router();

router.use(protect);

router.post("/upload", uploadVisits.single("book"), uploadVisitList);
router.get("/", listVisits);
router.get("/:id", getVisit);
router.delete("/:id", deleteVisit);

export default router;