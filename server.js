const express = require('express');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();

// Connect to Database 
connectDB();

// Init Middleware (formerly body-parser, now included in express natively)
app.use(express.json({
    extended: false
}));

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

const port = process.env.port || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));