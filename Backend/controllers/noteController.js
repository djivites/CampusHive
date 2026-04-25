const Note = require('../models/Note');

// @desc    Get user's quick note
// @route   GET /api/notes
exports.getNote = async (req, res) => {
  try {
    let note = await Note.findOne({ user: req.user._id });
    if (!note) {
      note = await Note.create({ user: req.user._id, content: '' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update or create quick note
// @route   POST /api/notes
exports.upsertNote = async (req, res) => {
  try {
    const { content } = req.body;
    let note = await Note.findOneAndUpdate(
      { user: req.user._id },
      { content },
      { new: true, upsert: true }
    );
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
