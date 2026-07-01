const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  type: { 
    type: String, 
    enum: ['TEAM_ADDED', 'MEMBER_JOINED', 'NEW_MESSAGE', 'TASK_ASSIGNED', 'TASK_COMPLETED'], 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  team: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team' 
  },
  task: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task' 
  },
  read: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
