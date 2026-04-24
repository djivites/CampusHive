const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// @route   POST /api/files/upload
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const file = await File.create({
      name: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      size: (req.file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: path.extname(req.file.originalname).substring(1).toUpperCase(),
      user: req.user._id
    });

    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/files
router.get('/', protect, async (req, res) => {
  try {
    const files = await File.find({ user: req.user._id });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
