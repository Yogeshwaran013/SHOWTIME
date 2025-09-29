import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Movies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const navigate = useNavigate();

  // Check login status and fetch movies on component mount
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const userEmail = sessionStorage.getItem('userEmail');
    
    if (!token || !userEmail) {
        navigate('/', { replace: true });
        return;
    }

    setIsLoggedIn(true);
    
    const fetchAssignedMovies = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/movies/assigned`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMovies(response.data);
        } catch (error) {
            console.error('Error fetching movies:', error);
            if (error.response?.status === 401) {
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('userEmail');
                setIsLoggedIn(false);
                navigate('/', { replace: true });
            }
        }
    };

    fetchAssignedMovies();
}, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    navigate("/");
  };

  const toggleMenu = () => {
    setShowMenu(prev => !prev);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
  };

  // Handle booking
  const handleBooking = (movieId, screen, time) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        Swal.fire({
            title: 'Authentication Required',
            text: 'Please login to book tickets',
            icon: 'warning',
            background: '#192133',
            color: '#fff',
            iconColor: '#e50914',
            confirmButtonColor: '#e50914'
        });
        navigate('/', { replace: true });
        return;
    }
    navigate(`/booking/${movieId}/${screen}/${time}`);
  };

  // Update modal click handler
  const handleModalTimeClick = (movieId, screen, time) => {
    setSelectedMovie(null);
    navigate(`/booking/${movieId}/${screen}/${time}`);
  };

  // Filter movies based on search
  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="movies-page">
      <div className="movies-navbar">
        {/* Left - Logo */}
        <Link to="/movies" className="logo-link">
          <img src="/images/logo1.png" alt="Showtime Logo" className="logo-image" />
        </Link>

        {/* Center - Search */}
        <input
          type="text"
          placeholder="Search for a movie..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="navbar-search"
        />

        {/* Right - About + Profile */}
        <div className="right-nav-section">
          <Link to="/about" className="nav-link">About</Link>
          
          <div className="profile-menu-wrapper">
            <button className="profile-btn" onClick={toggleMenu}>Profile ⏷</button>
            {showMenu && (
              <ul className="dropdown-menu">
                <li onClick={() => navigate('/profile')}>User details</li>
                <li onClick={handleLogout}>Logout</li>
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="movies-grid">
        {filteredMovies.map(movie => (
          <div 
            key={movie.movieId} 
            className="movie-card"
            onClick={() => handleMovieClick(movie)}
          >
            <img 
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
              alt={movie.title}
              className="movie-poster"
            />
            <div className="movie-info">
              <h3>{movie.title}</h3>
              <p className="screen-info">Screen {movie.screen}</p>
              <p className="release-date">Release: {new Date(movie.release_date).toLocaleDateString()}</p>
              {/* <div className="show-times">
                {movie.showTimes.map((time, index) => (
                  <button
                    key={index}
                    className="time-slot"
                    onClick={() => handleBooking(movie.movieId, movie.screen, time)}
                  >
                    {time}
                  </button>
                ))}
              </div> */}
              {/* <p>Price: ₹{movie.price}</p> */}
            </div>
          </div>
        ))}
      </div>

      {/* Show Times Modal */}
      {selectedMovie && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedMovie.title}</h2>
            <p>Screen {selectedMovie.screen}</p>
            <div className="show-times">
              {selectedMovie.showTimes.map((time, index) => (
                <button 
                  key={index}
                  className="time-slot"
                  onClick={() => handleModalTimeClick(selectedMovie.movieId, selectedMovie.screen, time)}
                >
                  {time}
                </button>
              ))}
            </div>
            <button 
              className="close-modal"
              onClick={() => setSelectedMovie(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
