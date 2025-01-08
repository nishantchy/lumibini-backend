require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const newsRoutes = require("./routes/newsRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const downloadRoutes = require("./routes/downloadRoutes");
const documentRoutes = require("./routes/documentRoutes");
const popUpRoutes = require("./routes/popUpRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/popup", popUpRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.log(error));
