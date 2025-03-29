const express = require('express');
const router = express.Router();
const Save = require('../models/Save');

// this saves a user.
router.post('/', async (req, res) => {
    const { username, timeElapsed, currentLocation, inventory } = req.body;

  try {
    const save = await Save.findOneAndUpdate(
      { username },
      { timeElapsed, currentLocation, inventory },
      { upsert: true, new: true }
    );
    res.json(save);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save progress' });
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
router.get('/:username', async (req, res) => {
  try {
    const save = await Save.findOne({
      username: new RegExp(`^${req.params.username}$`, 'i'),
    });

    if (!save) {
      return res.status(404).json({ error: 'Save file not found' });
    }

    res.json(save);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch save file' });
  }
});

module.exports = router;