import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Add this before the AdminDashboard component
const convertTo12Hour = (time24) => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const convertTo24Hour = (time12) => {
  const [time, modifier] = time12.split(' ');
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours);
  
  if (hours === 12) {
    hours = modifier === 'PM' ? 12 : 0;
  } else {
    hours = modifier === 'PM' ? hours + 12 : hours;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [formData, setFormData] = useState({
    id: '', // Added movie ID for TMDB reference
    title: '',
    release_date: '',
    poster_path: '',
    overview: '',
    screen: '1',
    showTimes: ['10:00', '14:00', '18:00', '22:00'], // 24-hour format
    language: 'ta',
    popularity: '',
    original_language: 'ta'
  });
  const [price, setPrice] = useState(200);
  const [assignedMovies, setAssignedMovies] = useState([]);

  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin');
    navigate('/admin-login');
  };

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin-login');
      return;
    }
    fetchMovies();
    fetchAssignedMovies();
  }, [navigate]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      // Fetch movies from TMDB API
      const tmdbResponse = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=4392246991f5d21361c98a57b519cffc&with_original_language=ta&region=IN&primary_release_date.gte=2021-01-01&primary_release_date.lte=2025-12-31`
      );
      
      // Get local database movies
      const localResponse = await axios.get('http://localhost:5000/api/movies');
      
      // Combine and format movies
      const tmdbMovies = tmdbResponse.data.results.map(movie => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        poster_path: movie.poster_path,
        overview: movie.overview,
        popularity: movie.popularity,
        original_language: movie.original_language
      }));

      setMovies(tmdbMovies);
      setError(null);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedMovies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/movies/assigned');
      setAssignedMovies(response.data);
    } catch (error) {
      console.error('Error fetching assigned movies:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const movieData = {
        movieId: selectedMovie.id.toString(),
        title: selectedMovie.title,
        release_date: selectedMovie.release_date,
        poster_path: selectedMovie.poster_path,
        overview: selectedMovie.overview,
        screen: Number(formData.screen),
        showTimes: formData.showTimes,
        price: Number(price)
      };

      await axios.post('http://localhost:5000/api/movies/assign', movieData);
      fetchMovies();
      fetchAssignedMovies();
      setSelectedMovie(null);
      alert('Movie successfully assigned to screen!');
    } catch (error) {
      console.error('Error saving movie:', error);
      alert('Failed to assign movie to screen');
    }
  };

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
    setFormData({
      ...formData,
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      overview: movie.overview,
      popularity: movie.popularity,
      original_language: movie.original_language
    });
  };

  const handleDelete = async (movieId) => {
    try {
      // Remove movie from screen assignment
      await axios.delete(`http://localhost:5000/api/movies/assign/${movieId}`);
      fetchMovies();
      fetchAssignedMovies();
      alert('Movie removed from screen');
    } catch (error) {
      console.error('Error removing movie:', error);
      alert('Failed to remove movie from screen');
    }
  };

  const handleClearSeats = async (movieId) => {
    if (window.confirm('Are you sure you want to clear all booked seats for this movie?')) {
      try {
        await axios.delete(`http://localhost:5000/api/movies/clear-seats/${movieId}`);
        alert('All seats cleared successfully');
      } catch (error) {
        console.error('Error clearing seats:', error);
        alert('Failed to clear seats');
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Movie Screen Management</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
      
      <div className="movies-list">
        <h2>Available Movies</h2>
        <div className="movies-grid">
          {movies.map((movie) => (
            <div 
              key={movie.id} 
              className={`movie-card ${selectedMovie?.id === movie.id ? 'selected' : ''}`}
              onClick={() => handleMovieSelect(movie)}
            >
              <img 
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
              />
              <div className="movie-info">
                <h3>{movie.title}</h3>
                <p>Release: {new Date(movie.release_date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMovie && (
        <div className="form-section">
          <h2>Assign Screen and Show Times</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Selected Movie: {selectedMovie.title}</label>
            </div>

            <div className="form-group">
              <label>Screen</label>
              <select
                value={formData.screen}
                onChange={(e) => setFormData({...formData, screen: e.target.value})}
                required
              >
                {[1, 2, 3, 4, 5].map(screen => (
                  <option key={screen} value={screen}>Screen {screen}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Ticket Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="100"
                max="1000"
                required
              />
            </div>

            <div className="form-group">
              <label>Show Times</label>
              <div className="show-times-grid">
                {formData.showTimes.map((time, index) => (
                  <input
                    key={index}
                    type="time"
                    value={time}
                    onChange={(e) => {
                      const newTimes = [...formData.showTimes];
                      newTimes[index] = e.target.value;
                      setFormData({...formData, showTimes: newTimes});
                    }}
                    required
                  />
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit">Assign to Screen</button>
              {selectedMovie && (
                <>
                  <button 
                    type="button" 
                    onClick={() => handleDelete(selectedMovie.id)}
                    className="delete-btn"
                  >
                    Remove from Screen
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleClearSeats(selectedMovie.id)}
                    className="clear-btn"
                  >
                    Clear Booked Seats
                  </button>
                </>
              )}
              <button type="button" onClick={() => setSelectedMovie(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="assigned-movies">
        <h2>Currently Assigned Movies</h2>
        <table>
          <thead>
            <tr>
              <th>Movie Title</th>
              <th>Screen</th>
              <th>Show Times</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignedMovies.map((movie) => (
              <tr key={movie.movieId}>
                <td>{movie.title}</td>
                <td>Screen {movie.screen}</td>
                <td>{movie.showTimes.map(time => convertTo12Hour(time)).join(', ')}</td>
                <td>₹{movie.price}</td>
                <td>
                  <button 
                    className="edit-btn"
                    onClick={() => {
                      setSelectedMovie({
                        id: movie.movieId,
                        title: movie.title,
                        release_date: movie.release_date,
                        poster_path: movie.poster_path,
                        overview: movie.overview
                      });
                      setFormData({
                        ...formData,
                        screen: movie.screen.toString(),
                        showTimes: movie.showTimes
                      });
                      setPrice(movie.price);
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(movie.movieId)}
                  >
                    Remove
                  </button>
                  <button 
                    className="clear-btn"
                    onClick={() => handleClearSeats(movie.movieId)}
                  >
                    Clear Seats
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;