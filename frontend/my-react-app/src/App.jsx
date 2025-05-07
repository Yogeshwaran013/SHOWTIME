import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './movie.css';
import './styles/Profile.css'
import './styles/AdminDashboard.css';

import Login from './pages/Login';
import Movies from './pages/Movie';
import About from './pages/about';
import BookingPage from './pages/BookingPage';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/about" element={<About/>} />
        <Route path="/booking/:movieId/:screen/:time" element={<BookingPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;