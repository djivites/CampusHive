const mongoose = require('mongoose');

const vivaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  milestones: [{
    title: String,
    date: Date,
    completed: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Viva', vivaSchema);
