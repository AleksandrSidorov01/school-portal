const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost/school-portal');
    console.log('MongoDB подключена');
  } catch (error) {
    console.error('Ошибка подключения:', error);
    process.exit(1);
  }
};

module.exports = connectDB;