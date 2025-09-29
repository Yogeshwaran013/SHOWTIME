import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminLogin.css';
import Swal from 'sweetalert2';

export default function AdminLogin() {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (credentials.username === 'showtime' && credentials.password === 'master123') {
            sessionStorage.setItem('isAdmin', 'true');
            Swal.fire({
                title: 'Welcome Admin! 👋',
                text: 'Login successful',
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
            navigate('/admin');
        } else {
            Swal.fire({
                title: 'Access Denied',
                text: 'Invalid username or password',
                icon: 'error',
                background: '#192133',
                color: '#fff',
                iconColor: '#e50914',
                confirmButtonColor: '#e50914'
            });
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-form">
                <h2>Admin Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
}