import express from 'express';
import Booking from '../models/Booking.js';

const router = express.Router();

// Create new booking
router.post('/', async (req, res) => {
  try {
    const {
      movieId,
      movieTitle,
      screen,
      showTime,
      seats,
      totalAmount,
      userEmail,
      showDate
    } = req.body;

    // Validate required fields
    if (!movieId || !movieTitle || !screen || !showTime || !seats || !totalAmount || !userEmail || !showDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if seats are already booked
    const existingBooking = await Booking.findOne({
      movieId,
      screen,
      showTime,
      showDate,
      seats: { $in: seats }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Some seats are already booked' });
    }

    // Create new booking
    const booking = new Booking({
      movieId,
      movieTitle,
      screen,
      showTime,
      seats,
      totalAmount,
      userEmail,
      showDate: new Date(showDate)
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all bookings for a user
router.get('/user/:userEmail', async (req, res) => {
  try {
    const bookings = await Booking.find({ userEmail: req.params.userEmail });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/booked-seats', async (req, res) => {
  try {
    const { movieId, screen, showTime, showDate } = req.query;
    
    const bookings = await Booking.find({
      movieId,
      screen,
      showTime,
      showDate: new Date(showDate)
    });

    const bookedSeats = bookings.reduce((seats, booking) => {
      return [...seats, ...booking.seats];
    }, []);

    res.json({ bookedSeats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a booking
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;