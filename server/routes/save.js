const express = require('express');
const router = express.Router();
const Save = require('../models/save');
// references the file in models.

// Save or update a dummy user
router.post('/', async (req, res) => {
  const { username, timeElapsed, levelsCompleted } = req.body;

  try {
    const save = await Save.findOneAndUpdate(
      { username },
      { timeElapsed, levelsCompleted },
      { upsert: true, new: true }
    );
    res.json(save);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// Get save by username
router.get('/:username', async (req, res) => {
  try {
    const save = await Save.findOne({ username: req.params.username });
    if (!save) return res.status(404).json({ error: 'User not found' });
    res.json(save);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load progress' });
  }
});

module.exports = router;