import express from "express";
import  protect  from "../middleware/auth.js";
import uploadBook from "../middleware/uploadBook.js";
import {
  uploadBookController,
  listBooksController,
  getBookController,
  askBookController,
  explainModuleController,
  toggleModuleController,
  deleteBookController
} from "../controllers/studyController.js";

const router = express.Router();
router.use(protect);

router.post("/books", uploadBook.single("book"), uploadBookController);
router.get("/books", listBooksController);
router.get("/books/:id", getBookController);
router.post("/books/:id/ask", askBookController);
router.post("/books/:id/modules/:index/explain", explainModuleController);
router.patch("/books/:id/modules/:index", toggleModuleController);
router.delete("/books/:id", deleteBookController);

export default router;