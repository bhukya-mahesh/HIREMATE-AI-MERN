import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files are allowed"));
};

// Placement reports can run longer than a resume/JD, so allow a bigger file than upload.js's 5MB.
const uploadVisits = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB max

export default uploadVisits;