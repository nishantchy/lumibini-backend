const express = require("express");
const { auth } = require("../middleware/authMiddleware");
const {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} = require("../controllers/newsController");

const router = express.Router();

// Routes
router.get("/", getAllNews); // Public
router.get("/:id", getNewsById); // Public
router.post("/", auth, createNews); // Authenticated
router.patch("/:id", auth, updateNews); // Authenticated
router.delete("/:id", auth, deleteNews); // Authenticated

module.exports = router;
