const cloudinary = require("../config/cloudinary");
const Gallery = require("../models/Gallery");

// Get all galleries
exports.getAllGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 });
    res.json(galleries);
  } catch (error) {
    console.error("Error fetching galleries:", error);
    res.status(500).json({ message: "Failed to fetch galleries" });
  }
};

// Get gallery by ID
exports.getGalleryById = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ message: "Gallery not found" });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create gallery
exports.createGallery = async (req, res) => {
  try {
    const { title, images } = req.body;

    // Validate images input
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: "No images provided" });
    }

    // Log the images being uploaded
    console.log("Images to upload:", images);

    // Upload images to Cloudinary
    const uploadPromises = images.map((image) => {
      return cloudinary.uploader.upload(image, {
        folder: "galleries", // Optional: specify a folder in Cloudinary
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);
    const imageUrls = uploadedImages.map((img) => img.secure_url); // Get the secure URLs of the uploaded images

    // Log the authenticated user for debugging
    console.log("Authenticated User:", req.user);

    // Create a new gallery instance
    const newGallery = new Gallery({
      title,
      images: imageUrls, // Store the array of image URLs
      user: req.user.id,
    });

    // Save the new gallery to the database
    await newGallery.save();

    return res.status(201).json({
      message: "Gallery created successfully",
      gallery: newGallery,
    });
  } catch (error) {
    console.error("Error creating gallery:", error.message);

    // Check for specific Cloudinary errors
    if (error.name === "Error") {
      console.error("Cloudinary Error:", error.message);
    }

    return res
      .status(500)
      .json({ message: "Failed to create gallery", error: error.message });
  }
};
// Update gallery
exports.updateGallery = async (req, res) => {
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
          folder: "gallery",
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
};

// Delete gallery
exports.deleteGallery = async (req, res) => {
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
      return cloudinary.uploader.destroy(`gallery/${publicId}`);
    });

    await Promise.all(deletePromises);
    await gallery.deleteOne();

    res.json({ message: "Gallery deleted successfully" });
  } catch (error) {
    console.error("Error deleting gallery:", error);
    res.status(500).json({ message: "Failed to delete gallery" });
  }
};
