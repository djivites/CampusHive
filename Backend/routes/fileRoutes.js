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
    console.log('Upload Request Body:', req.body);
    console.log('Upload Request File:', req.file);

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Ensure teamId is valid ObjectId or null
    let teamId = req.body.teamId;
    if (!teamId || teamId === 'null' || teamId === 'undefined' || teamId === '') {
      teamId = null;
    }

    console.log('Saving file with teamId:', teamId);

    // Use custom name if provided, otherwise use original name
    const extension = path.extname(req.file.originalname);
    const fileName = req.body.customName ? `${req.body.customName}${extension}` : req.file.originalname;

    const file = await File.create({
      name: fileName,
      url: `/uploads/${req.file.filename}`,
      size: (req.file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: extension.substring(1).toUpperCase(),
      user: req.user._id,
      team: teamId
    });

    console.log('File created successfully:', file._id);
    res.status(201).json(file);
  } catch (error) {
    console.error('Upload Error Details:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/files
// @desc    Get only personal files (no team)
router.get('/', protect, async (req, res) => {
  try {
    const files = await File.find({ user: req.user._id, team: null });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/files/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      console.log('Delete Error: File not found');
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.user.toString() !== req.user._id.toString()) {
      console.log(`Delete Error: Not authorized. File user: ${file.user}, Req user: ${req.user._id}`);
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Delete actual file
    // file.url starts with /uploads/
    const relativePath = file.url.startsWith('/') ? file.url.substring(1) : file.url;
    const filePath = path.join(__dirname, '..', relativePath);
    
    console.log(`Attempting to delete file at: ${filePath}`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('File deleted from filesystem');
    } else {
      console.log('File not found on filesystem, skipping unlink');
    }

    await File.findByIdAndDelete(req.params.id);
    res.json({ message: 'File deleted' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
