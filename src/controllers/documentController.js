const Document = require("../models/Document");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// Change to module.exports instead of exports.
module.exports = {
  uploadDocument: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No PDF file uploaded." });
      }

      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ message: "Title is required." });
      }

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "raw",
        folder: "documents",
      });

      // Create document in database
      const document = new Document({
        title,
        pdfUrl: result.secure_url,
        pdfPublicId: result.public_id,
        user: req.user.id,
      });

      await document.save();

      // Clean up temporary file
      fs.unlinkSync(req.file.path);

      res.status(201).json({
        message: "Document uploaded successfully",
        document,
      });
    } catch (error) {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  getAllDocuments: async (req, res) => {
    try {
      const documents = await Document.find();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  getDocument: async (req, res) => {
    try {
      const document = await Document.findOne({
        _id: req.params.id,
      });

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
  deleteDocument: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user._id || req.user.id;
      const document = await Document.findById(req.params.id);

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      if (userId.toString() !== document.user.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      try {
        await cloudinary.uploader.destroy(document.pdfPublicId, {
          resource_type: "raw",
        });
      } catch (cloudinaryError) {
        console.error(`Error deleting image:`, cloudinaryError);
        // You might want to handle this error more gracefully,
        // such as attempting database deletion even if Cloudinary fails
      }

      await document.deleteOne();

      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
};
