const express = require('express');
const Link = require('../models/Link');
const File = require('../models/File');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// --- Link Routes ---

// @route   POST /api/resources/links
router.post('/links', protect, async (req, res) => {
  try {
    const { title, url, teamId } = req.body;
    const link = await Link.create({
      title,
      url,
      team: teamId,
      user: req.user._id
    });
    res.status(201).json(link);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/resources/team/:teamId
router.get('/team/:teamId', protect, async (req, res) => {
  try {
    const [links, files] = await Promise.all([
      Link.find({ team: req.params.teamId }).populate('user', 'name'),
      File.find({ team: req.params.teamId }).populate('user', 'name')
    ]);
    res.json({ links, files });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
