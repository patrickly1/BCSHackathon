const express = require('express');
const router = express.Router();
const Save = require('../models/Save');


router.post('/', async (req, res) => {
  const { userId, username, timeElapsed, currentLocation, inventory } = req.body;

  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const saveData = {
    userId,
    username,
    timeElapsed,
    currentLocation,
    inventory,
  };

  try {
    const save = await Save.findOneAndUpdate(
      { userId },
      saveData,
      { upsert: true, new: true }
    );
    res.json(save);
  } catch (err) {
    console.error('Save failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// this is to create an array of all the usernames
router.get('/', async (req, res) => {
  try {
    const saves = await Save.find({}, 'username');
    const usernames = saves.map(save => save.username);
    res.json(usernames);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch save list' });
  }
});


// this is the router to get all the data related to a specific username
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const save = await Save.findOne({ userId });
      if (!save) {
        return res.status(404).json({ error: 'Save not found' });
      }
      res.json(save);
    } catch (err) {
      console.error('Load failed:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

module.exports = router;