const Task = require('../models/Task');
const Team = require('../models/Team');
const User = require('../models/User');

exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Get stats for user's tasks
    const totalTasks = await Task.countDocuments({ assignedTo: userId });
    const completedTasksCount = await Task.countDocuments({ assignedTo: userId, status: 'Completed' });
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasksCount / totalTasks) * 100);

    // 2. Priority Distribution
    const priorities = ['Low', 'Medium', 'High'];
    const priorityDistribution = await Promise.all(priorities.map(async (p) => ({
      name: p,
      value: await Task.countDocuments({ assignedTo: userId, priority: p })
    })));

    // 3. Team Productivity (Tasks per member in user's teams)
    const userTeams = await Team.find({ members: userId });
    const teamIds = userTeams.map(t => t._id);

    const productivity = await Task.aggregate([
      { $match: { team: { $in: teamIds } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', tasks: '$count' } },
      { $limit: 5 }
    ]);

    // 4. Task Completion Trend (Last 4 weeks)
    const trend = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - (i * 7 + 7));
      const end = new Date();
      end.setDate(end.getDate() - (i * 7));

      const completed = await Task.countDocuments({ 
        assignedTo: userId, 
        status: 'Completed',
        updatedAt: { $gte: start, $lte: end }
      });
      const pending = await Task.countDocuments({ 
        assignedTo: userId, 
        status: { $ne: 'Completed' },
        createdAt: { $lte: end }
      });

      trend.push({ name: `Week ${4-i}`, completed, pending });
    }

    // 5. Sprint Velocity (Completed tasks per week for last 5 weeks)
    const sprintVelocity = [];
    for (let i = 4; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - (i * 7 + 7));
      const end = new Date();
      end.setDate(end.getDate() - (i * 7));

      const count = await Task.countDocuments({
        assignedTo: userId,
        status: 'Completed',
        updatedAt: { $gte: start, $lte: end }
      });

      sprintVelocity.push({ name: `Week ${5-i}`, velocity: count });
    }

    // Use current week's velocity as Team Velocity
    const currentVelocity = sprintVelocity[sprintVelocity.length - 1].velocity;

    // 6. Avg. Task Time (Simplified)
...
    res.json({
      completionRate,
      teamVelocity: currentVelocity,
      activeMembers: activeMembersCount,
      avgTaskTime,
      trend,
      productivity,
      priorityDistribution,
      sprintVelocity
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
