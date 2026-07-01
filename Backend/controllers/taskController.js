const Task = require('../models/Task');
const Viva = require('../models/Viva');
const sendEmail = require('../utils/sendEmail');

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

    // Populate assignment and creator information for email notifications
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email settings')
      .populate('user', 'name')
      .populate('team', 'name');

    // Create & Emit In-App Notification if assigned to someone else
    if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
      const io = req.app.get('io');
      const { createAndEmitNotification } = require('./notificationController');
      const locationName = populatedTask.team?.name ? `in "${populatedTask.team.name}"` : 'on your board';
      await createAndEmitNotification(io, {
        recipient: task.assignedTo,
        sender: req.user._id,
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: `${req.user.name} assigned you: "${task.title}" ${locationName}.`,
        task: task._id,
        team: task.team
      });
    }

    if (populatedTask && populatedTask.assignedTo) {
      const assignee = populatedTask.assignedTo;
      // Default to true if settings or emailNotifications is undefined
      const isEmailEnabled = assignee.settings?.emailNotifications !== false;

      if (isEmailEnabled && assignee.email) {
        const creatorName = populatedTask.user?.name || 'Someone';
        const locationName = populatedTask.team?.name ? `team "${populatedTask.team.name}"` : 'your personal board';
        const dueDateStr = populatedTask.dueDate ? new Date(populatedTask.dueDate).toLocaleDateString() : 'No due date';

        const subject = `📋 New Task Assigned: ${populatedTask.title}`;
        const text = `Hello ${assignee.name},

You have been assigned a new task in CampusFlow:

Title: ${populatedTask.title}
Description: ${populatedTask.description || 'No description provided.'}
Priority: ${populatedTask.priority}
Due Date: ${dueDateStr}
Assigned By: ${creatorName}
Location: ${locationName}

Please log in to your dashboard to view the details.

Best regards,
CampusFlow Team`;

        const html = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1a202c;">
            <div style="text-align: center; margin-bottom: 25px;">
              <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">CampusFlow</h2>
              <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">Project Management Ecosystem</p>
            </div>
            
            <div style="border-top: 4px solid #4f46e5; padding-top: 20px;">
              <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Hello <strong>${assignee.name}</strong>,</h3>
              <p style="font-size: 15px; line-height: 1.6; color: #334155;">
                You have been assigned a new task by <strong>${creatorName}</strong> in <strong>${locationName}</strong>.
              </p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #475569; width: 120px; font-size: 14px; vertical-align: top;">Title:</td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: 700; font-size: 15px;">${populatedTask.title}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #475569; font-size: 14px; vertical-align: top;">Description:</td>
                    <td style="padding: 6px 0; color: #334155; font-size: 14px;">${populatedTask.description || 'No description provided.'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #475569; font-size: 14px; vertical-align: top;">Priority:</td>
                    <td style="padding: 6px 0; font-size: 14px;">
                      <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 700; background-color: ${populatedTask.priority === 'High' ? '#fee2e2' : populatedTask.priority === 'Medium' ? '#fef3c7' : '#d1fae5'}; color: ${populatedTask.priority === 'High' ? '#b91c1c' : populatedTask.priority === 'Medium' ? '#d97706' : '#059669'};">
                        ${populatedTask.priority}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #475569; font-size: 14px; vertical-align: top;">Due Date:</td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: 600; font-size: 14px;">${dueDateStr}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
                <a href={`${process.env.CLIENT_URL || 'http://localhost:5173'}/tasks`} style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 30px; font-weight: 700; border-radius: 9999px; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
                  View Task on Dashboard
                </a>
              </div>
            </div>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
              This is an automated notification from CampusFlow.<br />
              You received this because email notifications are enabled in your account settings.
            </div>
          </div>
        `;

        // Send email asynchronously and log errors if any, but do not block API response
        sendEmail({ to: assignee.email, subject, text, html })
          .catch(err => console.error(`[EMAIL ERROR] Failed to send notification to ${assignee.email}:`, err));
      }
    }

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

    const oldStatus = task.status;
    task.status = req.body.status;
    const updatedTask = await task.save();

    // Trigger notification if task was marked Completed
    if (task.status === 'Completed' && oldStatus !== 'Completed') {
      const io = req.app.get('io');
      const { createAndEmitNotification } = require('./notificationController');

      // Notify the task creator (if they are not the one who completed it)
      if (task.user.toString() !== req.user._id.toString()) {
        await createAndEmitNotification(io, {
          recipient: task.user,
          sender: req.user._id,
          type: 'TASK_COMPLETED',
          title: 'Task Completed',
          message: `${req.user.name} completed your task: "${task.title}".`,
          task: task._id,
          team: task.team
        });
      }
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
