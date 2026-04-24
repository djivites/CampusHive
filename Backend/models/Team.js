const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  projectTitle: { type: String },
  mode: { type: String, enum: ['Leader', 'Normal'], default: 'Leader' },
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);
module.exports = Team;
