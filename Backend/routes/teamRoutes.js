const express = require('express');
const { createTeam, getMyTeams, addMember, deleteTeam } = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .post(protect, createTeam)
  .get(protect, getMyTeams);

router.route('/:id')
  .delete(protect, deleteTeam);

router.post('/:id/members', protect, addMember);

module.exports = router;
