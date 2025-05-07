import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/bookings.js";
import movieRoutes from "./routes/movies.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "*",
}));
app.use(express.json());

// Routes - Remove the full URLs and just use paths
app.use("/api/auth", authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/movies', movieRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});