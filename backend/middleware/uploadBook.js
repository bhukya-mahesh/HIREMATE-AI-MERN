import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads", "books");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${req.user._id}-${Date.now()}.pdf`;
    cb(null, unique);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files are allowed"));
};

const uploadBook = multer({ storage, fileFilter, limits: { fileSize: 30 * 1024 * 1024 } });

export default uploadBook;