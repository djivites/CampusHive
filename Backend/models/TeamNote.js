const mongoose = require('mongoose');

const teamNoteSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, unique: true },
  content: { type: String, default: '' },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('TeamNote', teamNoteSchema);
