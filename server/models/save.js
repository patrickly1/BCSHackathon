const mongoose = require('mongoose');

const SaveSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  timeElapsed: { type: Number, required: true },
  levelsCompleted: { type: [String], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Save', SaveSchema);