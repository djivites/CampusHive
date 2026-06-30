const express = require('express');
const { registerUser, loginUser, getUserProfile, googleLogin, sendOTP } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/profile', protect, getUserProfile);

module.exports = router;
