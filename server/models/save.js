const mongoose = require('mongoose');

const saveSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    timeElapsed: { type: Number, default: 0 },
    currentLocation: { type: String, default: 'Level1' },
    inventory: { type: Object, default: {} } // ✅ new line
  });
  
  module.exports = mongoose.model('Save', saveSchema);