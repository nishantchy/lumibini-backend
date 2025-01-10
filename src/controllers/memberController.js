const Members = require("../models/Members");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

module.exports = {
  uploadMember: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file uploaded." });
      }

      const { name, post } = req.body;
      if (!name || !post) {
        return res.status(400).json({ message: "name and post are required." });
      }

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "members",
      });

      // Create member in database
      const member = new Members({
        name,
        imageUrl: result.secure_url,
        imagePublicId: result.public_id,
        post,
        user: req.user.id,
      });

      await member.save();

      // Clean up temporary file
      fs.unlinkSync(req.file.path);

      res.status(201).json({
        message: "Member uploaded successfully",
        member,
      });
    } catch (error) {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  getAllMembers: async (req, res) => {
    try {
      const members = await Members.find();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  getMember: async (req, res) => {
    try {
      const member = await Members.findOne({
        _id: req.params.id,
      });

      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }

      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  deleteMember: async (req, res) => {
    try {
      const member = await Members.findOne({
        _id: req.params.id,
        user: req.user.id,
      });

      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }

      // Delete from Cloudinary
      await cloudinary.uploader.destroy(member.imagePublicId);

      // Delete from database
      await member.deleteOne();

      res.json({ message: "Member deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
};
