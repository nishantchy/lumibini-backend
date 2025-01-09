const cloudinary = require("../config/cloudinary");
const Members = require("../models/Members");

// Get all Members
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Members.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    console.error("Error fetching Members:", error);
    res.status(500).json({ message: "Failed to fetch Members" });
  }
};

// Get Members by ID
exports.getMembersById = async (req, res) => {
  try {
    const member = await Members.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Members not found" });
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create Members
// Create Members
exports.createMembers = async (req, res) => {
  try {
    const { title, image, post } = req.body;

    // Validate image input
    if (!image || !Array.isArray(image) || image.length === 0) {
      return res
        .status(400)
        .json({ message: "No images provided or invalid image format" });
    }

    // Log the images being uploaded
    console.log("Image to upload:", image);

    // Upload images to Cloudinary
    const uploadPromises = image.map((i) => {
      return cloudinary.uploader.upload(i, {
        folder: "Members",
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);
    const imageUrls = uploadedImages.map((img) => img.secure_url); // Get the secure URLs of the uploaded images

    // Log the authenticated user for debugging
    console.log("Authenticated User:", req.user);

    // Create a new Members instance
    const newMember = new Members({
      title,
      image: imageUrls,
      post, // Store the array of image URLs
      user: req.user.id,
    });

    // Save the new Members to the database
    await newMember.save();

    return res.status(201).json({
      message: "Member created successfully",
      Member: newMember,
    });
  } catch (error) {
    console.error("Error creating Members:", error.message);

    // Check for specific Cloudinary errors
    if (error.name === "Error") {
      console.error("Cloudinary Error:", error.message);
    }

    return res
      .status(500)
      .json({ message: "Failed to create Members", error: error.message });
  }
};
// Update Members
exports.updateMembers = async (req, res) => {
  try {
    const { title, newImages } = req.body;

    const member = await Members.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Members not found" });
    }

    if (req.user._id.toString() !== member.user.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (newImages && Array.isArray(newImages) && newImages.length > 0) {
      const uploadPromises = newImages.map((image) =>
        cloudinary.uploader.upload(image, {
          folder: "Members",
        })
      );

      const uploadedImages = await Promise.all(uploadPromises);
      const newImageUrls = uploadedImages.map((img) => img.secure_url);
      member.image = [...member.image, ...newImageUrls];
    }

    if (title) {
      member.title = title;
    }

    await member.save();
    res.json(member);
  } catch (error) {
    console.error("Error updating Members:", error);
    res.status(500).json({ message: "Failed to update Members" });
  }
};

// Delete Members
exports.deleteMembers = async (req, res) => {
  try {
    const member = await Members.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Members not found" });
    }

    if (req.user._id.toString() !== member.user.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete images from Cloudinary
    const deletePromises = member.image.map((imageUrl) => {
      const publicId = imageUrl.split("/").pop().split(".")[0];
      return cloudinary.uploader.destroy(`Members/${publicId}`);
    });

    await Promise.all(deletePromises);
    await member.deleteOne();

    res.json({ message: "Members deleted successfully" });
  } catch (error) {
    console.error("Error deleting Members:", error);
    res.status(500).json({ message: "Failed to delete Members" });
  }
};
