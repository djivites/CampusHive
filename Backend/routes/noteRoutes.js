const express = require('express');
const { getNote, upsertNote } = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .get(protect, getNote)
  .post(protect, upsertNote);

module.exports = router;
