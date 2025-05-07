import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';



export default function Login() {
    const [isLogin, setIsLogin] = useState(true)
    const [user, setUser] = useState({
        fullname: "",
        email: "",
        password: "",
        cpassword: "",
    });
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({
        email: '',
        password: '',
        fullname: '',
        cpassword: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!user.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(user.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
    
        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!user.password) {
            newErrors.password = 'Password is required';
        } else if (!passwordRegex.test(user.password)) {
            newErrors.password = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        }
    
        // Additional signup validations
        if (!isLogin) {
            if (!user.fullname) {
                newErrors.fullname = 'Full name is required';
            }
            
            if (!user.cpassword) {
                newErrors.cpassword = 'Please confirm your password';
            } else if (user.password !== user.cpassword) {
                newErrors.cpassword = 'Passwords do not match';
            }
        }
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            const url = isLogin
                ? "http://localhost:5000/api/auth/login"
                : "http://localhost:5000/api/auth/register";
            
            const { data } = await axios.post(url, user);
            setMessage(data.message || "Success!");

            if (isLogin && data.token) {
                // Store in sessionStorage instead of localStorage
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('userEmail', user.email);
                navigate("/movies");
            } else {
                setIsLogin(true);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || "Something went wrong!");
        }
    };
    
    return (
        <>
            <div id="loginpage">
                <div className="auth-form" id="authForm">
                    <div id="registerForm">
                        <h2>{isLogin ? "Login" : "Register"} for Movie Tickets</h2>
                        <form id="registrationForm" onSubmit={handleSubmit}>
                            {!isLogin && (
                                <div>
                                    <label htmlFor="fullname">Full Name</label>
                                    <input 
                                        type="text" 
                                        id="fullname" 
                                        name="fullname" 
                                        placeholder="Enter your full name" 
                                        onChange={handleChange}
                                        className={errors.fullname ? 'error-input' : ''}
                                        required 
                                    />
                                    {errors.fullname && <div className="error">{errors.fullname}</div>}
                                </div>
                            )}

                            <div>
                                <label htmlFor="email">Email</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    placeholder="Enter your email" 
                                    onChange={handleChange}
                                    className={errors.email ? 'error-input' : ''}
                                    required 
                                />
                                {errors.email && <div className="error">{errors.email}</div>}
                            </div>

                            <div>
                                <label htmlFor="password">Password</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password" 
                                    placeholder="Create a password" 
                                    onChange={handleChange}
                                    className={errors.password ? 'error-input' : ''}
                                    required 
                                />
                                {errors.password && <div className="error">{errors.password}</div>}
                            </div>

                            {!isLogin && (
                                <div>
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <input 
                                        type="password" 
                                        id="cpassword" 
                                        name="cpassword" 
                                        placeholder="Confirm your password" 
                                        onChange={handleChange}
                                        className={errors.cpassword ? 'error-input' : ''}
                                        required 
                                    />
                                    {errors.cpassword && <div className="error">{errors.cpassword}</div>}
                                </div>
                            )}
                            <button  type="submit">{isLogin ? "Login" : "Register"}</button>
                            <p className="error-msg">{message}</p>
                            

<div className="form-footer-msg">
  <p>{isLogin ? "Don't have an account?" : "Already have an account?"}</p>
</div>
<div className="top-switch">
  <span onClick={() => setIsLogin(p => !p)}>{!isLogin ? "Sign In" : "Sign Up"}</span>
</div>



                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
{/* <div className="form-switch">
  <p>
    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
    <span onClick={() => setIsLogin(p => !p)}>
      {!isLogin ? "Sign In" : "Sign Up"}
    </span>
  </p>
</div> */}
