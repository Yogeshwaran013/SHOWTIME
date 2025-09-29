import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Add JWT secret to your environment variables or define it here
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post("/register", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ 
      message: "User registered successfully",
      user: {
        id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email
      }
    });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ 
      message: "Registration failed",
      error: err.message 
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ 
      message: "Login successful",
      user: { 
        id: user._id, 
        fullname: user.fullname, 
        email: user.email 
      },
      token
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      message: "Something went wrong during login",
      error: err.message 
    });
  }
});

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// Upload profile photo
router.post("/upload-photo", upload.single('profilePhoto'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const photoUrl = `/uploads/${req.file.filename}`;
    user.profilePhoto = photoUrl;
    await user.save();

    res.json({ photoUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: "Error uploading photo" });
  }
});

// Update user email
router.put("/update-email", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { email } = req.body;
    
    // Check if email is already in use
    const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    user.email = email;
    await user.save();

    res.json({ message: "Email updated successfully", email });
  } catch (error) {
    console.error('Update email error:', error);
    res.status(500).json({ message: "Error updating email" });
  }
});

// Make sure the export is at the bottom of the file
export default router;