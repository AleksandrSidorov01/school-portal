const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./db');

async function addUsers() {
  try {
    // Подключаемся к базе
    await connectDB();

    // Генерируем хеши паролей
    const adminPassword = bcrypt.hashSync('пароль', 8); // пароль для админа
    const teacher1Password = bcrypt.hashSync('пароль', 8); // пароль для учителя
    const teacher2Password = bcrypt.hashSync('пароль', 8); // пароль для учителя

    // Создаем пользователей
    const admin = new User({
      login: 'Логин', //Впишите ваш логин который будет использоваться для сайта (админ)
      password: adminPassword,
      role: 'admin'
    });
    const teacher1 = new User({
      login: 'Логин', //Впишите ваш логин который будет использоваться для сайта (учитель)
      password: teacher1Password,
      role: 'teacher'
    });
    const teacher2 = new User({
      login: 'Логин', //Впишите ваш логин который будет использоваться для сайта (учитель)
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

// файл запускается через powershell 
