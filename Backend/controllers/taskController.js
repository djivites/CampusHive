const Task = require('../models/Task');
const Viva = require('../models/Viva');

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

    // Get upcoming deadlines
    const upcomingDeadlines = await Task.find({ 
      assignedTo: req.user._id, 
      status: { $ne: 'Completed' },
      dueDate: { $exists: true, $ne: null }
    })
    .sort({ dueDate: 1 })
    .limit(3)
    .populate('team', 'name');

    // Get recent activity
    const recentActivity = await Task.find({ 
      assignedTo: req.user._id 
    })
    .sort({ updatedAt: -1 })
    .limit(3)
    .populate('team', 'name');

    // Generate real chart data for last 7 days (Tasks Created)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const count = await Task.countDocuments({
        assignedTo: req.user._id,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      chartData.push({
        name: startOfDay.toLocaleDateString('en-US', { weekday: 'short' }),
        tasks: count
      });
    }

    // Get nearest Viva
    const nearestViva = await Viva.findOne({ 
      user: req.user._id,
      date: { $gte: new Date() }
    }).sort({ date: 1 });

    let daysToViva = 0;
    if (nearestViva) {
      daysToViva = Math.ceil((new Date(nearestViva.date) - new Date()) / (1000 * 60 * 60 * 24));
    }

    res.json({
      totalTasks,
      pendingTasks,
      completedTasks,
      completionPercentage,
      upcomingDeadlines,
      recentActivity,
      chartData,
      daysToViva
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

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
exports.updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is authorized (assigned to task or creator)
    if (task.assignedTo.toString() !== req.user._id.toString() && task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    task.status = req.body.status;
    const updatedTask = await task.save();

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
