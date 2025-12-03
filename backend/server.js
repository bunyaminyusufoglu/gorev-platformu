const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectDB = require('./config/database');
connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Görev Platformu API - Çalışıyor!' });
});

// Auth Routes
app.use('/api/auth', require('./routes/auth'));

// Category Routes
app.use('/api/categories', require('./routes/category'));

// Task Routes
app.use('/api/tasks', require('./routes/task'));

// Task Completion Routes
app.use('/api/task-completions', require('./routes/taskCompletion'));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Bir hata oluştu!', 
    error: process.env.NODE_ENV === 'development' ? err.message : {} 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route bulunamadı!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor...`);
});

