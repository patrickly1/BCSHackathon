require('dotenv').config(); // Load .env variables
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Optional: DB connection
const saveRoutes = require('./routes/save');
connectDB();
// const gameRoutes = require('./routes/game'); // Optional: API routes

const app = express();

// Connect Database (Optional)
// connectDB();

// Middleware
app.use(cors()); // Allow requests from your frontend
app.use(express.json()); // Parse JSON request bodies

app.use('/api/save', saveRoutes);

// Define Routes (Optional)
// app.use('/api/game', gameRoutes);

app.get('/', (req, res) => {
  res.send('Git Escape Room Server Running');
});

const PORT = process.env.PORT || 5001; // Use port from .env or default

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));