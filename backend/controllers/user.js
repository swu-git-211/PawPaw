const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Register a new user
exports.registerUser = async (req, res) => {
    const { email, username, password } = req.body;

    try {
        // Check if email or username already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, username, password: hashedPassword });
        await newUser.save();

        // สร้าง JWT Token โดยเพิ่ม username เข้าไปใน payload
        const token = jwt.sign(
            { userId: newUser._id, username: newUser.username }, // ใช้ newUser ที่ถูกสร้างขึ้น
            process.env.JWT_SECRET, // คีย์ลับที่ใช้ในการเข้ารหัส
            { expiresIn: '1h' } // อายุการใช้งาน 1 ชั่วโมง
        );

        res.status(201).json({ success: true, message: 'User registered successfully', token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

// Login user
exports.loginUser = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        // ตรวจสอบ identifier (username หรือ email)
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email/username or password' });
        }

        // ตรวจสอบรหัสผ่าน
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid email/username or password' });
        }

        // สร้าง JWT Token
        const token = jwt.sign(
            { userId: user._id, username: user.username }, // payload ของ token
            process.env.JWT_SECRET, // secret key
            { expiresIn: '1h' } // อายุการใช้งาน 1 ชั่วโมง
        );

        // เพิ่ม userId เข้าไปใน response
        res.status(200).json({ 
            success: true, 
            message: 'Login successful!', 
            token, 
            userId: user._id // ส่ง userId กลับไปยัง frontend
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get profile of logged-in user
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // ดึง userId จาก token
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update profile and upload image
exports.updateProfile = async (req, res) => {
    try {
        console.log('Request Body:', req.body); // Log form data
        console.log('Uploaded File:', req.file); // Log uploaded file info
        console.log('User ID:', req.user.userId); // Log user ID from auth middleware

        const updatedData = req.body;
        if (req.file) {
            updatedData.profileImage = '/uploads/' + req.file.filename;
        }

        const updatedUser = await User.findByIdAndUpdate(req.user.userId, updatedData, {
            new: true,
            runValidators: true,
        });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

