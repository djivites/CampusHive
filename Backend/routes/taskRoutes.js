const express = require('express');
const { createTask, getTasks, updateTaskStatus, getTaskStats, getTeamTasks } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .post(protect, createTask)
  .get(protect, getTasks);

router.get('/stats', protect, getTaskStats);
router.get('/team/:teamId', protect, getTeamTasks);
router.put('/:id/status', protect, updateTaskStatus);

module.exports = router;
