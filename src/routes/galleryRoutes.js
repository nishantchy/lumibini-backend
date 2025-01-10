const express = require("express");
const router = express.Router();
const galleryController = require("../controllers/galleryController");
const { auth } = require("../middleware/authMiddleware");
const multer = require("multer");

// Configure multer for temporary file storage
const upload = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit per file
  fileFilter: (req, file, cb) => {
    const validMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (validMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, GIF) are allowed!"), false);
    }
  },
});

// Route handlers
router.post(
  "/",
  auth,
  upload.array("images", 10), // Accept up to 10 images
  galleryController.createGallery
);
router.get("/", galleryController.getAllGalleries);
router.get("/:id", galleryController.getGalleryById);
router.patch("/:id", auth, galleryController.updateGallery);
router.delete("/:id", auth, galleryController.deleteGallery);

module.exports = router;
