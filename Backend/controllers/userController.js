const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/users/profile
exports.getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      settings: updatedUser.settings
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user settings
// @route   PUT /api/users/settings
exports.updateUserSettings = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    Object.assign(user.settings, req.body);
    const updatedUser = await user.save();
    res.json(updatedUser.settings);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users
exports.deleteUserAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    // Ideally delete related data too, but for now just the user
    res.json({ message: 'User account deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
