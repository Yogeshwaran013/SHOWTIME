import express from "express";
import Movie from "../models/movie.js";
import Booking from "../models/Booking.js";

const router = express.Router();

// Get all movies
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all assigned movies
router.get("/assigned", async (req, res) => {
  try {
    const movies = await Movie.find({ isActive: true });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create movie
router.post("/", async (req, res) => {
  try {
    const movie = new Movie(req.body);
    const newMovie = await movie.save();
    res.status(201).json(newMovie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Assign movie to screen
router.post("/assign", async (req, res) => {
  try {
    const { movieId, title, release_date, poster_path, overview, screen, showTimes, price } = req.body;
    
    // Check if movie already exists
    let movie = await Movie.findOne({ movieId });
    
    if (movie) {
      // Update existing movie
      movie.screen = screen;
      movie.showTimes = showTimes;
      movie.price = price;
      movie.isActive = true;
      await movie.save();
    } else {
      // Create new movie
      movie = new Movie({
        movieId,
        title,
        release_date,
        poster_path,
        overview,
        screen,
        showTimes,
        price
      });
      await movie.save();
    }
    
    res.status(201).json(movie);
  } catch (error) {
    console.error('Error in /assign route:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update movie
router.put("/:id", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json(movie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete movie
router.delete("/:id", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json({ message: "Movie deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove movie from screen
router.delete("/assign/:movieId", async (req, res) => {
  try {
    const movie = await Movie.findOneAndUpdate(
      { movieId: req.params.movieId },
      { isActive: false },
      { new: true }
    );
    
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    
    res.json({ message: "Movie removed from screen" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear seats
router.post("/:id/clear-seats", async (req, res) => {
  try {
    await Booking.deleteMany({ movieId: req.params.id });
    res.json({ message: "All seats cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear booked seats for a movie
router.delete("/clear-seats/:movieId", async (req, res) => {
  try {
    await Booking.deleteMany({ movieId: req.params.movieId });
    res.json({ message: "All seats cleared for this movie" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;