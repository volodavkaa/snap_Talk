const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const connectDB = require('./db');
const User = require('../src/models/User');
const Post = require('../src/models/Post');

require('dotenv').config();

const app = express();
const upload = multer(); // Ініціалізація Multer для завантаження файлів

// Підключення до MongoDB
connectDB();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

async function uploadImageToAzure(file) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient('image');
  const blobName = `${Date.now()}-${file.originalname}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.upload(file.buffer, file.size);
  return blockBlobClient.url;
}

// Реєстрація користувача
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Користувач з такою електронною поштою вже існує' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Користувача успішно створено' });
  } catch (error) {
    res.status(500).json({ error: 'Сталася помилка сервера' });
  }
});

// Авторизація користувача
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Неправильна електронна пошта або пароль' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Неправильна електронна пошта або пароль' });
    }
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

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    req.user = user;
    next();
  });
};

// Захищений маршрут для завантаження зображень
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const imageUrl = await uploadImageToAzure(file);
    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Не вдалося завантажити зображення' });
  }
});

// Створення посту
app.post('/api/posts', upload.single('image'), authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;
    let imageUrl = '';

    if (file) {
      imageUrl = await uploadImageToAzure(file);
    }

    const post = new Post({
      title,
      description,
      imageUrl,
      author: req.user.userId,
    });

    await post.save();

    // Оновлення користувача, додавання ID нового посту до масиву posts
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $push: { posts: post._id } },
      { new: true }
    );

    res.status(201).json({ message: 'Пост успішно створено', post });
  } catch (error) {
    res.status(500).json({ error: 'Не вдалося створити пост' });
  }
});

// Маршрут для отримання всіх постів (для вкладки "Пости")
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'name'); // Завантажуємо ім'я автора
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Не вдалося отримати пости' });
  }
});

// Отримання профілю користувача
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('posts');
    if (!user) {
      return res.status(404).json({ error: 'Користувач не знайдений' });
    }
    res.json({
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      photoUrl: user.photoUrl,
      posts: user.posts,
    });
  } catch (error) {
    res.status(500).json({ error: 'Сталася помилка при отриманні даних профілю' });
  }
});

// Завантаження аватара
app.post('/api/upload-avatar', upload.single('image'), authenticateToken, async (req, res) => {
  try {
    const file = req.file;
    const imageUrl = await uploadImageToAzure(file);

    await User.findByIdAndUpdate(req.user.userId, { photoUrl: imageUrl });

    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Не вдалося завантажити аватар' });
  }
});
// Оновлення профілю користувача (з використанням middleware для аутентифікації)
app.post('/api/update-profile', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId; // Отримання userId з аутентифікації

    // Оновіть ім'я користувача в базі даних
    const updatedUser = await User.findByIdAndUpdate(userId, { name }, { new: true });
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'Користувач не знайдений' });
    }

    res.status(200).json({ message: 'Профіль оновлено успішно', user: updatedUser });
  } catch (error) {
    console.error('Помилка при оновленні профілю:', error);
    res.status(500).json({ error: 'Не вдалося оновити профіль' });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущено на порту ${PORT}`));
