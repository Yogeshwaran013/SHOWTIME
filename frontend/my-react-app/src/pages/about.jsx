import React from 'react';
import { Link } from 'react-router-dom';
// import './About.css';

export default function About() {
  return (
    <div className="about-wrapper">
      {/* About Page Navbar */}
      <nav className="about-navbar">
        <Link to="/movies" className="about-logo">
          <img src="/images/logo1.png" alt="Showtime Logo" />
        </Link>
        <ul className="about-nav-links">
          <li><Link to="/movies">Movies</Link></li>
          <li><Link to="/login">Login</Link></li>
        </ul>
      </nav>

      {/* About Content */}
      <div className="about-content">
        <h1>About Showtime</h1>
        <p>
          Showtime is your one-stop destination for movie ticket bookings. Explore top-rated films,
          book seats, and enjoy a seamless movie-going experience.
        </p>
        <ul>
          <li>Search and browse a wide range of movies</li>
          <li>Book your favorite seats easily</li>
          <li>Enjoy quick access to your account</li>
        </ul>
        <p>
          We're passionate about movies and strive to provide the best platform for all movie lovers!
        </p>
      </div>
    </div>
  );
}
