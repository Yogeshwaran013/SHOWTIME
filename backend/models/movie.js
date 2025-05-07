import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  movieId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  release_date: {
    type: String,
    required: true
  },
  poster_path: {
    type: String,
    required: true
  },
  overview: {
    type: String,
    required: true
  },
  screen: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 200
  },
  showTimes: [{
    type: String,
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Movie', movieSchema);

