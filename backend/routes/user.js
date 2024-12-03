const express = require('express');
const router = express.Router();
const user = require('../controllers/user');
const auth = require('../middleware/auth'); // middleware สำหรับตรวจสอบการ authentication
const multer = require('multer');
const path = require('path');

// ตั้งค่า Multer สำหรับการอัปโหลดรูปภาพ
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // จำกัดขนาดไฟล์ไม่ให้เกิน 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
});

// POST: /pawpaw/register
router.post('/register', user.registerUser);

// POST: /pawpaw/login
router.post('/login', user.loginUser);

// Get user profile
router.get('/profile', auth, user.getProfile);

// Update user profile
router.put('/profile', auth, upload.single('profileImage'), user.updateProfile);

module.exports = router;
