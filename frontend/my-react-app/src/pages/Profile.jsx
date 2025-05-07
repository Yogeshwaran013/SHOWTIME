import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Profile.css';

export default function Profile() {
    const [user, setUser] = useState({
        fullname: '',
        email: '',
        profilePhoto: '/images/default-avatar.png'
    });
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = sessionStorage.getItem('token');
            const userEmail = sessionStorage.getItem('userEmail');

            if (!token || !userEmail) {
                navigate('/', { replace: true });
                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        const fetchBookings = async () => {
            const token = sessionStorage.getItem('token');
            const userEmail = sessionStorage.getItem('userEmail');

            try {
                const response = await axios.get(`http://localhost:5000/api/bookings/user/${userEmail}`);
                setBookings(response.data);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
        fetchBookings();
    }, [navigate]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profilePhoto', file);
            
            try {
                const token = sessionStorage.getItem('token');
                const response = await axios.post('http://localhost:5000/api/auth/upload-photo', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                });
                setUser(prev => ({ ...prev, profilePhoto: response.data.photoUrl }));
            } catch (error) {
                console.error('Error uploading photo:', error);
                alert('Failed to upload photo');
            }
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-photo-container">
                    <img 
                        src={user.profilePhoto} 
                        alt="Profile" 
                        className="profile-photo"
                    />
                    <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="photo-upload" className="photo-upload-btn">
                        Change Photo
                    </label>
                </div>
                <div className="profile-info">
                    <h1>{user.fullname}</h1>
                    <p>{user.email}</p>
                </div>
            </div>

            <div className="booking-history">
                <h2>Booking History</h2>
                {bookings.length === 0 ? (
                    <p>No bookings found</p>
                ) : (
                    <div className="bookings-grid">
                        {bookings.map((booking) => (
                            <div key={booking._id} className="booking-card">
                                <h3>{booking.movieTitle}</h3>
                                <div className="booking-details">
                                    <p>Screen: {booking.screen}</p>
                                    <p>Show Time: {booking.showTime}</p>
                                    <p>Date: {new Date(booking.showDate).toLocaleDateString()}</p>
                                    <p>Seats: {booking.seats.join(', ')}</p>
                                    <p>Amount: ₹{booking.totalAmount}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}