const Popup = require("../models/Popup");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

module.exports = {
  uploadPopUp: async (req, res) => {
    let uploadedFile = null;
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No PDF file uploaded." });
      }

      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ message: "Title is required." });
      }

      uploadedFile = req.file.path;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "raw",
        folder: "popups",
      });

      // Create popup in database
      const popup = new Popup({
        title,
        pdfUrl: result.secure_url,
        pdfPublicId: result.public_id,
        user: req.user.id,
      });

      await popup.save();

      // Clean up temporary file
      if (fs.existsSync(uploadedFile)) {
        fs.unlinkSync(uploadedFile);
      }

      res.status(201).json({
        message: "Popup uploaded successfully",
        popup, // Changed from document to popup
      });
    } catch (error) {
      // Clean up file if it exists and there was an error
      if (uploadedFile && fs.existsSync(uploadedFile)) {
        try {
          fs.unlinkSync(uploadedFile);
        } catch (unlinkError) {
          console.error("Error deleting temporary file:", unlinkError);
        }
      }
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  },

  getAllPopUp: async (req, res) => {
    try {
      const popups = await Popup.find({}).sort({ createdAt: -1 }); // Remove user filter and sort by newest
      res.json(popups);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  getPopUp: async (req, res) => {
    try {
      const popup = await Popup.findById(req.params.id); // Remove user filter

      if (!popup) {
        return res.status(404).json({ message: "Popup not found" });
      }

      res.json(popup);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  deletePopUp: async (req, res) => {
    try {
      const popup = await Popup.findOne({
        _id: req.params.id,
        user: req.user.id,
      });

      if (!popup) {
        return res.status(404).json({ message: "Popup not found" });
      }

      try {
        // Delete from Cloudinary
        await cloudinary.uploader.destroy(popup.pdfPublicId);
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError);
        // Continue with deletion from database even if Cloudinary delete fails
      }

      // Delete from database
      await popup.deleteOne();

      res.json({ message: "Popup deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
};
