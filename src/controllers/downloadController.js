const cloudinary = require("../config/cloudinary");
const Download = require("../models/Download");

// Get all downloads
exports.getAllDownloads = async (req, res) => {
  try {
    const downloads = await Download.find();
    res.json(downloads);
  } catch (error) {
    console.error("Error fetching downloads:", error);
    res.status(500).json({ error: error.message });
  }
};

// Upload a PDF
exports.uploadPDF = async (req, res) => {
  try {
    const { title } = req.body; // Extract title from the request body

    // Check if a file was uploaded
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("Uploading file to Cloudinary...");

    // Upload the file to Cloudinary directly from the buffer
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "downloads", resource_type: "raw" },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );

      // Pipe the file buffer to the upload stream
      uploadStream.end(req.file.buffer);
    });

    // Save the download info (Cloudinary public ID) in your database
    const download = new Download({
      title: title || "Untitled",
      public_id: uploadResponse.public_id,
      url: uploadResponse.secure_url,
      user: req.user.id, // Adjust as needed for user association
    });

    await download.save();
    console.log("Download saved to database:", download);
    res.status(201).json(download);
  } catch (error) {
    console.error("Error uploading file or saving download:", error);
    res.status(500).json({ error: error.message });
  }
};
// Delete a PDF
exports.deleteDownload = async (req, res) => {
  try {
    const download = await Download.findById(req.params.id);
    if (!download) {
      console.error("Download not found:", req.params.id);
      return res.status(404).json({ message: "Download not found" });
    }

    if (req.user.id !== download.user.toString()) {
      console.error("Unauthorized deletion attempt by user:", req.user.id);
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete the file from Cloudinary
    console.log("Deleting file from Cloudinary:", download.public_id);
    await cloudinary.uploader.destroy(download.public_id, {
      resource_type: "raw",
    });

    await download.remove();
    console.log("Download deleted from database:", req.params.id);
    res.json({ message: "Download deleted" });
  } catch (error) {
    console.error("Error deleting download:", error);
    res.status(500).json({ error: error.message });
  }
};
