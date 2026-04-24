const Task = require('../models/Task');

// @desc    Get dashboard stats
// @route   GET /api/tasks/stats
exports.getTaskStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({ assignedTo: req.user._id });
    const pendingTasks = await Task.countDocuments({ 
      assignedTo: req.user._id, 
      status: { $ne: 'Completed' } 
    });
    const completedTasks = await Task.countDocuments({ 
      assignedTo: req.user._id, 
      status: 'Completed' 
    });

    const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    res.json({
      totalTasks,
      pendingTasks,
      completedTasks,
      completionPercentage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get only tasks assigned to ME (Personal Focus)
// @route   GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('assignedTo', 'name')
      .populate('team', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get team tasks
// @route   GET /api/tasks/team/:teamId
exports.getTeamTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ team: req.params.teamId })
      .populate('assignedTo', 'name')
      .populate('user', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
  const { title, description, status, priority, dueDate, team, assignedTo } = req.body;

  try {
    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      status,
      priority,
      dueDate,
      team,
      // Default to creator if no one is assigned
      assignedTo: assignedTo || req.user._id
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
