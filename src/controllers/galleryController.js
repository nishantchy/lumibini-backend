const Gallery = require("../models/Gallery");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

module.exports = {
  getAllGalleries: async (req, res) => {
    try {
      const galleries = await Gallery.find().sort({ createdAt: -1 });
      res.json(galleries);
    } catch (error) {
      console.error("Error fetching galleries:", error);
      res.status(500).json({ message: "Failed to fetch galleries" });
    }
  },

  getGalleryById: async (req, res) => {
    try {
      const gallery = await Gallery.findById(req.params.id);
      if (!gallery)
        return res.status(404).json({ message: "Gallery not found" });
      res.json(gallery);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createGallery: async (req, res) => {
    try {
      const { title } = req.body;
      const files = req.files; // Files provided by multer

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No image files provided" });
      }

      // Validate title
      if (!title) {
        return res.status(400).json({ message: "Title is required." });
      }

      // Upload images to Cloudinary
      const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            file.path,
            { folder: "galleries" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
        });
      });

      const uploadedImages = await Promise.all(uploadPromises);
      const imageUrls = uploadedImages.map((img) => img.secure_url);
      const imagePublicIds = uploadedImages.map((img) => img.public_id);

      // Clean up temporary files
      files.forEach((file) => fs.unlinkSync(file.path));

      // Create a new gallery instance
      const newGallery = new Gallery({
        title,
        images: imageUrls,
        imagePublicIds: imagePublicIds,
        user: req.user.id,
      });

      // Save the new gallery to the database
      await newGallery.save();

      return res.status(201).json({
        message: "Gallery created successfully",
        gallery: newGallery,
      });
    } catch (error) {
      if (req.files) {
        req.files.forEach((file) => fs.unlinkSync(file.path));
      }
      console.error("Error creating gallery:", error.message);
      return res
        .status(500)
        .json({ message: "Failed to create gallery", error: error.message });
    }
  },

  updateGallery: async (req, res) => {
    try {
      const { title, newImages } = req.body;

      const gallery = await Gallery.findById(req.params.id);
      if (!gallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }

      if (req.user._id.toString() !== gallery.user.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      if (newImages && Array.isArray(newImages) && newImages.length > 0) {
        const uploadPromises = newImages.map((image) =>
          cloudinary.uploader.upload(image, {
            folder: "galleries",
          })
        );

        const uploadedImages = await Promise.all(uploadPromises);
        const newImageUrls = uploadedImages.map((img) => img.secure_url);
        gallery.images = [...gallery.images, ...newImageUrls];
      }

      if (title) {
        gallery.title = title;
      }

      await gallery.save();
      res.json(gallery);
    } catch (error) {
      console.error("Error updating gallery:", error);
      res.status(500).json({ message: "Failed to update gallery" });
    }
  },

  deleteGallery: async (req, res) => {
    try {
      const gallery = await Gallery.findById(req.params.id);
      if (!gallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }

      if (req.user._id.toString() !== gallery.user.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Delete images from Cloudinary
      const deletePromises = gallery.images.map((imageUrl) => {
        const publicId = imageUrl.split("/").pop().split(".")[0];
        return cloudinary.uploader.destroy(`galleries/${publicId}`);
      });

      await Promise.all(deletePromises);
      await gallery.deleteOne();

      res.json({ message: "Gallery deleted successfully" });
    } catch (error) {
      console.error("Error deleting gallery:", error);
      res.status(500).json({ message: "Failed to delete gallery" });
    }
  },
};
