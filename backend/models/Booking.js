import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  movieId: {
    type: String,
    required: true
  },
  movieTitle: {
    type: String,
    required: true
  },
  screen: {
    type: Number,
    required: true
  },
  showTime: {
    type: String,
    required: true
  },
  seats: [{
    type: String,
    required: true
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  showDate: {
    type: Date,
    required: true
  },
  bookingDate: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Booking', bookingSchema);