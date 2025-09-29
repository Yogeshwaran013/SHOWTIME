import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BookingPage.css';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function BookingPage() {
  const { movieId, screen, time } = useParams();
  const navigate = useNavigate();
  
  const [movieDetails, setMovieDetails] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookedSeats, setBookedSeats] = useState([]);

  const theaterConfig = {
    name: "VETRI CINEMAS",
    prices: {
      premium: 300,
      standard: 200,
      budget: 150
    }
  };

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=${import.meta.env.VITE_MOVIE_API_KEY}`
        );
        const data = await response.json();
        setMovieDetails(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  const fetchBookedSeats = async () => {
    try {
      const showDate = new Date().toISOString().split('T')[0]; // Current date
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/bookings/booked-seats`, {
        params: {
          movieId,
          screen,
          showTime: time,
          showDate
        }
      });
      setBookedSeats(response.data.bookedSeats);
    } catch (error) {
      console.error('Error fetching booked seats:', error);
    }
  };

  useEffect(() => {
    fetchBookedSeats();
  }, [movieId, screen, time]);

  const handleSeatSelect = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) {
      return; // Seat is already booked
    }

    setSelectedSeats(prev => {
      // Check if seat is already selected
      if (prev.includes(seatNumber)) {
        return prev.filter(seat => seat !== seatNumber);
      }
      // Check if maximum seats are already selected
      if (prev.length >= 10) {
        Swal.fire({
          title: 'Maximum Seats Reached',
          text: 'You can only select up to 10 seats',
          icon: 'warning',
          confirmButtonText: 'OK',
          background: '#192133',
          color: '#fff',
          iconColor: '#e50914',
          confirmButtonColor: '#e50914'
        });
        return prev;
      }
      // Add new seat
      return [...prev, seatNumber];
    });
  };

  const renderSeats = (section, rows, seatsPerRow, startRow = 0) => {
    const seats = [];
    for (let row = 0; row < rows; row++) {
      const currentRow = String.fromCharCode(65 + startRow + row);
      const rowSeats = [];
      
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        const seatNumber = `${currentRow}${seat}`;
        const isBooked = bookedSeats.includes(seatNumber);
        
        rowSeats.push(
          <button
            key={seatNumber}
            className={`seat ${section} 
              ${selectedSeats.includes(seatNumber) ? 'selected' : ''} 
              ${isBooked ? 'booked' : ''}`}
            onClick={() => handleSeatSelect(seatNumber)}
            disabled={isBooked}
            title={isBooked ? 'Already Booked' : `Seat ${seatNumber}`}
          >
            {seatNumber}
          </button>
        );
      }
      
      seats.push(
        <div key={currentRow} className="seat-row">
          <span className="row-label">{currentRow}</span>
          {rowSeats}
        </div>
      );
    }
    return seats;
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => {
      const row = seat.charAt(0);
      if (row >= 'A' && row <= 'D') return total + theaterConfig.prices.premium;
      if (row >= 'E' && row <= 'J') return total + theaterConfig.prices.standard;
      return total + theaterConfig.prices.budget;
    }, 0);
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      Swal.fire({
        title: 'No Seats Selected',
        text: 'Please select at least one seat',
        icon: 'warning',
        background: '#192133',
        color: '#fff',
        iconColor: '#e50914',
        confirmButtonColor: '#e50914'
      });
      return;
    }

    try {
      const showDate = new Date().toISOString().split('T')[0];
      const userEmail = sessionStorage.getItem('userEmail');
      
      if (!userEmail) {
        Swal.fire({
          title: 'Authentication Required',
          text: 'Please login to book tickets',
          icon: 'error',
          background: '#192133',
          color: '#fff',
          iconColor: '#e50914',
          confirmButtonColor: '#e50914'
        });
        navigate('/', { replace: true });
        return;
      }

      const bookingData = {
        movieId,
        movieTitle: movieDetails.title,
        screen: parseInt(screen),
        showTime: time,
        seats: selectedSeats,
        totalAmount: calculateTotal(),
        userEmail: userEmail,
        showDate: showDate
      };

      // Validate data before sending
      for (const [key, value] of Object.entries(bookingData)) {
        if (!value && value !== 0) {
          throw new Error(`Missing required field: ${key}`);
        }
      }

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/bookings`, bookingData);

      if (response.status === 201) {
        Swal.fire({
          title: 'Booking Confirmed! 🎫',
          text: 'Your tickets have been booked successfully',
          icon: 'success',
          background: '#192133',
          color: '#fff',
          iconColor: '#28a745',
          confirmButtonColor: '#e50914',
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          }
        });
        await fetchBookedSeats();
        setSelectedSeats([]);
        navigate('/movies');
      }
    } catch (error) {
      console.error('Booking failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to process booking. Please try again.';
      Swal.fire({
        title: 'Booking Failed',
        text: errorMessage,
        icon: 'error',
        background: '#192133',
        color: '#fff',
        iconColor: '#e50914',
        confirmButtonColor: '#e50914'
      });
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="booking-page">
      {movieDetails && (
        <div className="movie-details">
          <div className="movie-poster">
            <img 
              src={`https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`} 
              alt={movieDetails.title} 
            />
          </div>
          <div className="movie-info">
            <h1>{movieDetails.title}</h1>
            <p className="movie-overview">{movieDetails.overview}</p>
            <div className="movie-metadata">
              <p>Release Date: {new Date(movieDetails.release_date).toLocaleDateString()}</p>
              <p>Runtime: {movieDetails.runtime} minutes</p>
              <p>Rating: {movieDetails.vote_average.toFixed(1)}/10</p>
            </div>
          </div>
        </div>
      )}

      <div className="theater-info">
        <h2>{theaterConfig.name}</h2>
        <p>Screen {screen} • {time}</p>
      </div>

      {/* <div className="screen">
        <p>SCREEN</p>
      </div> */}

      <div className="seating-layout">
        <div className="section premium-section">
          <h3>Premium - ₹{theaterConfig.prices.premium}</h3>
          {renderSeats('premium', 4, 12, 0)}
        </div>
        
        <div className="section standard-section">
          <h3>Standard - ₹{theaterConfig.prices.standard}</h3>
          {renderSeats('standard', 6, 14, 4)}
        </div>
        
        <div className="section budget-section">
          <h3>Budget - ₹{theaterConfig.prices.budget}</h3>
          {renderSeats('budget', 4, 16, 10)}
        </div>
      </div>
      <div className="screen">
        <p>SCREEN</p>
      </div>

      <div className="booking-summary">
        <h3>Booking Summary</h3>
        <p>Selected Seats: {selectedSeats.join(', ') || 'None'}</p>
        <p>Total Amount: ₹{calculateTotal()}</p>
        <button 
          className="confirm-booking"
          onClick={handleBooking}
          disabled={selectedSeats.length === 0}
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}