const mongoose = require("mongoose");

const downloadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    public_id: {
      type: String,
      required: true,
    }, // Store the Cloudinary public ID for easy deletion
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

const Download = mongoose.model("Download", downloadSchema);

module.exports = Download;
