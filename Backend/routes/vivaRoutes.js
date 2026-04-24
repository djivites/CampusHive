const express = require('express');
const { getVivas, createViva, updateMilestone } = require('../controllers/vivaController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .get(protect, getVivas)
  .post(protect, createViva);

router.put('/:id/milestones/:milestoneId', protect, updateMilestone);

module.exports = router;
