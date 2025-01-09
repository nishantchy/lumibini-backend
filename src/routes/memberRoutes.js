const express = require("express");
const { auth } = require("../middleware/authMiddleware");
const {
  getAllMembers,
  getMembersById,
  createMembers,
  updateMembers,
  deleteMembers,
} = require("../controllers/memberController");

const router = express.Router();

// Public routes - no authentication needed
router.get("/", getAllMembers);
router.get("/:id", getMembersById);

// Protected routes - require authentication
router.post("/", auth, createMembers);
router.patch("/:id", auth, updateMembers);
router.delete("/:id", auth, deleteMembers);

module.exports = router;
