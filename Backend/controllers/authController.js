const User = require('../models/User');
const OTP = require('../models/OTP');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store/Update OTP in DB
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    const subject = '📋 CampusFlow - Confirm Your Email Address';
    const text = `Hello,

Your verification code is: ${otp}

This code is valid for 5 minutes. If you did not request this code, please ignore this email.

Best regards,
CampusFlow Team`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1a202c;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">CampusFlow</h2>
          <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">Project Management Ecosystem</p>
        </div>
        <div style="border-top: 4px solid #4f46e5; padding-top: 20px; text-align: center;">
          <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Confirm Your Email Address</h3>
          <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 25px;">
            Use the verification code below to verify your email address and complete your signup.
          </p>
          <div style="background-color: #f8fafc; border: 1px dashed #4f46e5; border-radius: 8px; padding: 15px; margin: 25px 0; display: inline-block;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4f46e5;">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
            This code is valid for <strong>5 minutes</strong>. If you did not request this code, please ignore this email.
          </p>
        </div>
      </div>
    `;

    try {
      await sendEmail({ to: email, subject, text, html });
      res.status(200).json({ message: 'Verification code sent to your email' });
    } catch (err) {
      console.error('OTP Send Email Error:', err);
      res.status(500).json({ message: 'Error sending verification email. Please check your SMTP settings.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  const { name, email, password, otp } = req.body;

  try {
    // Validate password complexity on backend
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({ 
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Verify OTP
    if (!otp) {
      return res.status(400).json({ message: 'Verification code (OTP) is required' });
    }

    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    const user = await User.create({ name, email, password });

    if (user) {
      // Delete used OTP
      await OTP.deleteOne({ email });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
        settings: user.settings,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
        settings: user.settings,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
exports.getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || "",
      settings: user.settings,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Google Login user
// @route   POST /api/auth/google
exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    // Verify token with Google API (alternative to google-auth-library)
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const ticket = await googleRes.json();

    if (ticket.error) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    const { email, name, picture } = ticket;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with random password
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      user = await User.create({ 
        name, 
        email, 
        password: randomPassword,
        avatar: picture || ""
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      settings: user.settings,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
