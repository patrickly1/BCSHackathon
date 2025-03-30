const mongoose = require('mongoose');

const SaveSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // 👈 Add this
  username: { type: String }, // Optional for display
  timeElapsed: { type: Number, default: 0 },
  currentLocation: { type: String, default: 'Level1' },
  inventory: { type: Object, default: {} },
});

module.exports = mongoose.model('Save', SaveSchema);