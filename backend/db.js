const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://volodavkaa:LWsusbuvSzEcEMmJ@cluster0.yruwl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('MongoDB підключено!');
  } catch (error) {
    console.error('Помилка підключення до MongoDB:', error);
    process.exit(1); // Зупиняємо процес у разі помилки
  }
};

module.exports = connectDB;
