const express = require("express");
const { auth } = require("../middleware/authMiddleware");
const {
  getAllGalleries,
  getGalleryById,
  createGallery,
  updateGallery,
  deleteGallery,
} = require("../controllers/galleryController");

const router = express.Router();

// Public routes - no authentication needed
router.get("/", getAllGalleries);
router.get("/:id", getGalleryById);

// Protected routes - require authentication
router.post("/", auth, createGallery);
router.patch("/:id", auth, updateGallery);
router.delete("/:id", auth, deleteGallery);

module.exports = router;
