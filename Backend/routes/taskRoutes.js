const express = require('express');
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .post(protect, taskController.createTask)
  .get(protect, taskController.getTasks);

router.get('/stats', protect, taskController.getTaskStats);
router.get('/team/:teamId', protect, taskController.getTeamTasks);
router.put('/:id/status', protect, taskController.updateTaskStatus);

module.exports = router;
