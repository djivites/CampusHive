const Note = require('../models/Note');
const Team = require('../models/Team');
const TeamNote = require('../models/TeamNote');

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

// @desc    Get team's shared note
// @route   GET /api/notes/team/:teamId
exports.getTeamNote = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    // Check if team exists and user is a member
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Verify membership
    const isMember = team.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );
    if (!isMember && team.lead.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You are not a member of this team' });
    }

    let note = await TeamNote.findOne({ team: teamId });
    if (!note) {
      note = await TeamNote.create({ team: teamId, content: '' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update or create team's shared note
// @route   POST /api/notes/team/:teamId
exports.upsertTeamNote = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { content } = req.body;

    // Check if team exists and user is a member
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Verify membership
    const isMember = team.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );
    if (!isMember && team.lead.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You are not a member of this team' });
    }

    let note = await TeamNote.findOneAndUpdate(
      { team: teamId },
      { content, lastUpdatedBy: req.user._id },
      { new: true, upsert: true }
    );

    // Broadcast update via Socket.io to the team's room
    const io = req.app.get('io');
    if (io) {
      io.to(teamId).emit('note_updated', {
        teamId,
        content,
        lastUpdatedBy: {
          _id: req.user._id,
          name: req.user.name
        }
      });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

