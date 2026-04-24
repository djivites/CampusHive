const Viva = require('../models/Viva');

exports.getVivas = async (req, res) => {
  try {
    const vivas = await Viva.find({ user: req.user._id });
    res.json(vivas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createViva = async (req, res) => {
  try {
    const viva = await Viva.create({ ...req.body, user: req.user._id });
    res.status(201).json(viva);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateMilestone = async (req, res) => {
  try {
    const viva = await Viva.findOne({ _id: req.params.id, user: req.user._id });
    if (!viva) return res.status(404).json({ message: 'Viva not found' });

    const milestone = viva.milestones.id(req.params.milestoneId);
    if (milestone) {
      milestone.completed = !milestone.completed;
      await viva.save();
    }
    res.json(viva);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
