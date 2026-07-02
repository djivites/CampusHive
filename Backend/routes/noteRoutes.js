const express = require('express');
const { getNote, upsertNote, getTeamNote, upsertTeamNote } = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .get(protect, getNote)
  .post(protect, upsertNote);

router.route('/team/:teamId')
  .get(protect, getTeamNote)
  .post(protect, upsertTeamNote);

module.exports = router;
