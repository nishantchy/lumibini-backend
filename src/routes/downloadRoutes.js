const express = require("express");
const { auth } = require("../middleware/authMiddleware");
const {
  uploadPDF,
  getAllDownloads,
  deleteDownload,
} = require("../controllers/downloadController");

const router = express.Router();

// Protect the upload and delete routes with authentication
router.post("/uploads", auth, uploadPDF);
router.delete("/:id", auth, deleteDownload);
router.get("/", getAllDownloads);

module.exports = router;
