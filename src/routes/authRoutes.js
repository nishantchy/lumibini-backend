const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const router = express.Router();

// POST /auth/register
router.post("/register", registerUser);

// POST /auth/login
router.post("/login", loginUser);

module.exports = router;
