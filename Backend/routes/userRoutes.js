const express = require('express');
const { 
  getUserProfile, 
  updateUserProfile, 
  updateUserSettings, 
  deleteUserAccount 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.put('/settings', protect, updateUserSettings);
router.delete('/', protect, deleteUserAccount);

module.exports = router;
