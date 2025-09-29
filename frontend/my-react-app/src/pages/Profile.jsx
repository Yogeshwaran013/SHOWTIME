import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Profile.css';
import Swal from 'sweetalert2';

export default function Profile() {
    const [user, setUser] = useState({
        fullname: '',
        email: '',
        profilePhoto: '/images/default-avatar.png'
    });
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newEmail, setNewEmail] = useState('');
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
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);
                setNewEmail(response.data.email);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        const fetchBookings = async () => {
            const token = sessionStorage.getItem('token');
            const userEmail = sessionStorage.getItem('userEmail');

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/bookings/user/${userEmail}`);
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
                const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/upload-photo`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                });
                setUser(prev => ({ ...prev, profilePhoto: response.data.photoUrl }));
            } catch (error) {
                console.error('Error uploading photo:', error);
                Swal.fire({
                    title: 'Upload Failed',
                    text: 'Failed to upload profile photo',
                    icon: 'error',
                    background: '#192133',
                    color: '#fff',
                    iconColor: '#e50914',
                    confirmButtonColor: '#e50914'
                });
            }
        }
    };

    const handleEmailUpdate = async () => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/auth/update-email`, 
                { email: newEmail },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            
            setUser(prev => ({ ...prev, email: newEmail }));
            sessionStorage.setItem('userEmail', newEmail);
            setIsEditing(false);
            
            Swal.fire({
                title: 'Success!',
                text: 'Email updated successfully',
                icon: 'success',
                background: '#192133',
                color: '#fff',
                iconColor: '#28a745',
                confirmButtonColor: '#e50914'
            });
        } catch (error) {
            console.error('Error updating email:', error);
            Swal.fire({
                title: 'Update Failed',
                text: 'Failed to update email',
                icon: 'error',
                background: '#192133',
                color: '#fff',
                iconColor: '#e50914',
                confirmButtonColor: '#e50914'
            });
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: 'This will permanently delete your booking',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#e50914',
                cancelButtonColor: '#333',
                confirmButtonText: 'Yes, delete it!',
                background: '#192133',
                color: '#fff'
            });

            if (result.isConfirmed) {
                const token = sessionStorage.getItem('token');
                await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/bookings/${bookingId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setBookings(bookings.filter(booking => booking._id !== bookingId));
                
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your booking has been deleted',
                    icon: 'success',
                    background: '#192133',
                    color: '#fff',
                    iconColor: '#28a745',
                    confirmButtonColor: '#e50914'
                });
            }
        } catch (error) {
            console.error('Error deleting booking:', error);
            Swal.fire({
                title: 'Delete Failed',
                text: 'Failed to delete booking',
                icon: 'error',
                background: '#192133',
                color: '#fff',
                iconColor: '#e50914',
                confirmButtonColor: '#e50914'
            });
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
                    {isEditing ? (
                        <div className="email-edit">
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="email-input"
                            />
                            <div className="email-actions">
                                <button onClick={handleEmailUpdate} className="save-btn">Save</button>
                                <button onClick={() => {
                                    setIsEditing(false);
                                    setNewEmail(user.email);
                                }} className="cancel-btn">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="email-display">
                            <p>{user.email}</p>
                            <button onClick={() => setIsEditing(true)} className="edit-btn">
                                Edit Email
                            </button>
                        </div>
                    )}
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
                                <button 
                                    onClick={() => handleDeleteBooking(booking._id)}
                                    className="delete-booking-btn"
                                >
                                    Delete Booking
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}