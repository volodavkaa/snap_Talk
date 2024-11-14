const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connectDB = require('./db');
const User = require('./models/User');

const app = express();

// Підключення до MongoDB
connectDB();
app.use(cors());
// Middleware для обробки JSON
app.use(express.json());

// Маршрут для реєстрації
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Перевірка, чи існує користувач з таким же email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Користувач з такою електронною поштою вже існує' });
    }

    // Хешування пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Створення нового користувача
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: 'Користувача успішно створено' });
  } catch (error) {
    res.status(500).json({ error: 'Сталася помилка сервера' });
  }
});

// Маршрут для авторизації
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Пошук користувача за email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Неправильна електронна пошта або пароль' });
    }

    // Перевірка пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Неправильна електронна пошта або пароль' });
    }

    // Створення JWT токена
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Сталася помилка сервера' });
  }
});

// Middleware для перевірки токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401); // Немає токена

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.sendStatus(403); // Недійсний токен
    req.user = user;
    next();
  });
};

// Захищений маршрут
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Це захищені дані', user: req.user });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущено на порту ${PORT}`));
