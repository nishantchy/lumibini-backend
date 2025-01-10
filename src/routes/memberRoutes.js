const express = require("express");
const router = express.Router();
const memberController = require("../controllers/memberController");
const { auth } = require("../middleware/authMiddleware");
const multer = require("multer");

// Configure multer for temporary file storage
const upload = multer({
  storage: multer.diskStorage({}),
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
router.post("/", auth, upload.single("image"), memberController.uploadMember);
router.get("/", memberController.getAllMembers);
router.get("/:id", memberController.getMember);
router.delete("/:id", auth, memberController.deleteMember);

module.exports = router;
