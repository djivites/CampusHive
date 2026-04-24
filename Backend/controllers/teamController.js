const Team = require('../models/Team');

// @desc    Create a new team
// @route   POST /api/teams
exports.createTeam = async (req, res) => {
  const { name, description, projectTitle, mode } = req.body;

  try {
    const team = await Team.create({
      name,
      description,
      projectTitle,
      mode: mode || 'Leader',
      lead: req.user._id,
      members: [req.user._id]
    });
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a team
// @route   DELETE /api/teams/:id
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // Only lead can delete
    if (team.lead.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only team lead can delete the team' });
    }

    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's teams
// @route   GET /api/teams
exports.getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({ members: req.user._id })
      .populate('members', 'name email avatar')
      .populate('lead', 'name email');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add member to team
// @route   POST /api/teams/:id/members
exports.addMember = async (req, res) => {
  const { email } = req.body;
  const User = require('../models/User');

  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // Only lead can add members
    if (team.lead.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only team lead can add members' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: 'User not found' });

    if (team.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: 'User already in team' });
    }

    team.members.push(userToAdd._id);
    await team.save();

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
