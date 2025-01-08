const express = require("express");
const router = express.Router();
const popUpController = require("../controllers/popUpController");
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
router.post("/", auth, upload.single("pdf"), popUpController.uploadPopUp);
router.get("/", popUpController.getAllPopUp);
router.get("/:id", popUpController.getPopUp);
router.delete("/:id", auth, popUpController.deletePopUp);

module.exports = router;
