const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./db');

async function addUsers() {
  try {
    // Подключаемся к базе
    await connectDB();

    // Генерируем хеши паролей
    const adminPassword = bcrypt.hashSync('xXxDom1xXx', 8);
    const teacher1Password = bcrypt.hashSync('010508', 8);
    const teacher2Password = bcrypt.hashSync('150901', 8);

    // Создаем пользователей
    const admin = new User({
      login: 'Aleksandr',
      password: adminPassword,
      role: 'admin'
    });
    const teacher1 = new User({
      login: 'Anna',
      password: teacher1Password,
      role: 'teacher'
    });
    const teacher2 = new User({
      login: 'Umeda',
      password: teacher2Password,
      role: 'teacher'
    });

    // Сохраняем в базу
    await admin.save();
    await teacher1.save();
    await teacher2.save();

    console.log('Админ и два учителя добавлены успешно!');
  } catch (error) {
    console.error('Ошибка:', error.message);
  } finally {
    // Закрываем соединение
    mongoose.connection.close();
  }
}

addUsers();