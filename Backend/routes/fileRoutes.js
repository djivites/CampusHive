const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const File = require('../models/File');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Memory storage for multer so files are kept in RAM buffer before streaming to GridFS
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   POST /api/files/upload
// @desc    Upload file to MongoDB GridFS
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Ensure teamId is valid ObjectId or null
    let teamId = req.body.teamId;
    if (!teamId || teamId === 'null' || teamId === 'undefined' || teamId === '') {
      teamId = null;
    }

    const extension = path.extname(req.file.originalname);
    const fileName = req.body.customName ? `${req.body.customName}${extension}` : req.file.originalname;

    // Create write stream to GridFS
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'fs'
    });

    const uploadStream = bucket.openUploadStream(fileName, {
      contentType: req.file.mimetype
    });

    // Write binary buffer to GridFS
    uploadStream.end(req.file.buffer);

    uploadStream.on('error', (err) => {
      console.error('GridFS Upload Error:', err);
      res.status(500).json({ message: 'Failed to save file to database' });
    });

    uploadStream.on('finish', async () => {
      const fileId = uploadStream.id;

      const file = await File.create({
        name: fileName,
        url: `/api/files/download/${fileId}`,
        size: (req.file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: extension.substring(1).toUpperCase(),
        user: req.user._id,
        team: teamId
      });

      console.log('File uploaded to GridFS and meta saved:', file._id);
      res.status(201).json(file);
    });
  } catch (error) {
    console.error('Upload Error Details:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/files/download/:id
// @desc    Download/stream file from GridFS
router.get('/download/:id', async (req, res) => {
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'fs'
    });

    const fileId = new mongoose.Types.ObjectId(req.params.id);

    // Find file details in GridFS files metadata collection
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const fileMetadata = files[0];
    res.set({
      'Content-Type': fileMetadata.contentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileMetadata.filename)}"`
    });

    // Stream from GridFS to response
    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Download Error:', error);
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
// @desc    Delete file from database and GridFS (or local filesystem for old files)
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

    // Check if it's an old local file or a new GridFS file
    if (file.url.startsWith('/uploads/')) {
      // Old file: delete from filesystem
      const relativePath = file.url.startsWith('/') ? file.url.substring(1) : file.url;
      const filePath = path.join(__dirname, '..', relativePath);
      console.log(`Attempting to delete local file at: ${filePath}`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('File deleted from local filesystem');
      }
    } else if (file.url.startsWith('/api/files/download/')) {
      // New GridFS file: delete from GridFS bucket
      const parts = file.url.split('/');
      const fileIdStr = parts[parts.length - 1];
      
      try {
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
          bucketName: 'fs'
        });
        await bucket.delete(new mongoose.Types.ObjectId(fileIdStr));
        console.log('File deleted from GridFS');
      } catch (err) {
        console.warn('GridFS Delete Warning:', err.message);
      }
    }

    await File.findByIdAndDelete(req.params.id);
    res.json({ message: 'File deleted' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
