const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const { auth } = require("../middleware/authMiddleware");
const multer = require("multer");

// Configure multer for temporary file storage
const upload = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  },
});

// Fixed route handlers
router.post("/", auth, upload.single("pdf"), documentController.uploadDocument);
router.get("/", documentController.getAllDocuments);
router.get("/:id", documentController.getDocument);
router.delete("/:id", auth, documentController.deleteDocument);

module.exports = router;
