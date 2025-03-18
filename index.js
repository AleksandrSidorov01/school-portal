const express = require('express');
const connectDB = require('./db');
const User = require('./models/User');
const Student = require('./models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json()); // Для обработки JSON-запросов
app.use(express.static('public')); // Для отдачи HTML-файлов из папки public

// Middleware для проверки токена и ролей
const authMiddleware = (roles) => (req, res, next) => {
  let token = req.headers['authorization'];
  if (!token) return res.status(401).send('Токен не предоставлен');
  if (token.startsWith('Bearer ')) token = token.slice(7); // Убираем "Bearer "
  try {
    const decoded = jwt.verify(token, 'secretkey');
    if (roles && !roles.includes(decoded.role)) return res.status(403).send('Доступ запрещен');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send('Неверный токен');
  }
};

// Регистрация пользователя (автоматически роль "student")
app.post('/register', async (req, res) => {
  const { login, password } = req.body;
  console.log('Запрос на /register:', req.body); // Отладка
  try {
    const existingUser = await User.findOne({ login });
    if (existingUser) {
      return res.status(400).send('Пользователь с таким логином уже существует');
    }
    const hashedPassword = bcrypt.hashSync(password, 8);
    const user = new User({ login, password: hashedPassword, role: 'student' });
    await user.save();
    res.send('Пользователь зарегистрирован');
  } catch (error) {
    res.status(400).send('Ошибка: ' + error.message);
  }
});

// Вход пользователя
app.post('/login', async (req, res) => {
  const { login, password } = req.body;
  console.log('Запрос на /login:', req.body); // Отладка
  const user = await User.findOne({ login });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).send('Неверный логин или пароль');
  }
  const token = jwt.sign({ id: user._id, role: user.role }, 'secretkey', { expiresIn: '1h' });
  res.json({ token });
});

// Добавление ученика (только для админа)
app.post('/students', authMiddleware('admin'), async (req, res) => {
  const { name, class: studentClass } = req.body;
  console.log('Запрос на /students:', req.body); // Отладка
  try {
    const student = new Student({
      name,
      class: studentClass,
      addedBy: req.user.id,
    });
    await student.save();
    res.send('Ученик добавлен');
  } catch (error) {
    res.status(400).send('Ошибка: ' + error.message);
  }
});

// Получение списка учеников
app.get('/students', authMiddleware(), async (req, res) => {
  try {
    let students;
    if (req.user.role === 'admin') {
      students = await Student.find().populate('addedBy', 'login');
    } else {
      students = await Student.find().select('-addedBy'); // Исключаем поле addedBy
    }
    res.json(students);
  } catch (error) {
    res.status(400).send('Ошибка: ' + error.message);
  }
});

// Добавление оценки (только для учителя)
app.post('/grades', authMiddleware('teacher'), async (req, res) => {
  const { studentId, subject, grade } = req.body;
  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).send('Ученик не найден');
    student.grades.push({ subject, grade });
    await student.save();
    res.send(`Оценка ${grade} добавлена для ${subject}`);
  } catch (error) {
    res.status(400).send('Ошибка: ' + error.message);
  }
});

// Удаление ученика (только для админа)
app.delete('/students/:id', authMiddleware('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const student = await Student.findByIdAndDelete(id);
    if (!student) return res.status(404).send('Ученик не найден');
    res.send('Ученик удален');
  } catch (error) {
    res.status(400).send('Ошибка: ' + error.message);
  }
});

// Изменение оценки (для админа и учителя)
app.put('/students/:studentId/grades/:gradeId', authMiddleware(['admin', 'teacher']), async (req, res) => {
  const { studentId, gradeId } = req.params;
  const { subject, grade } = req.body;
  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).send('Ученик не найден');
    const gradeToUpdate = student.grades.id(gradeId);
    if (!gradeToUpdate) return res.status(404).send('Оценка не найдена');
    gradeToUpdate.subject = subject;
    gradeToUpdate.grade = grade;
    await student.save();
    res.send(`Оценка изменена на ${grade} для ${subject}`);
  } catch (error) {
    res.status(400).send('Ошибка: ' + error.message);
  }
});

// Главная страница
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Запуск сервера
const start = async () => {
  try {
    await connectDB();
    app.listen(3000, () => {
      console.log('Сервер запущен на http://localhost:3000');
    });
  } catch (error) {
    console.error('Ошибка запуска сервера:', error);
  }
};

start();