const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const mongoose = require('mongoose');
const connectDB = require('./db');
const User = require('./models/User');
const Post = require('./models/Post');
const Message = require('./models/Message');
require('dotenv').config();

const app = express();
connectDB();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const upload = multer();
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

async function uploadImageToAzure(file) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient('image');
  const blobName = `${Date.now()}-${file.originalname}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.upload(file.buffer, file.size);
  return blockBlobClient.url;
}


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


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
    res.json({ token, userId: user._id }); 
  } catch (error) {
    res.status(500).json({ error: 'Сталася помилка сервера' });
  }
});


app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const imageUrl = await uploadImageToAzure(file);
    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Не вдалося завантажити зображення' });
  }
});


app.post('/api/posts', upload.single('image'), authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;
    let imageUrl = '';
    if (file) imageUrl = await uploadImageToAzure(file);

    const post = new Post({
      title,
      description,
      imageUrl,
      author: req.user.userId,
    });
    await post.save();

    await User.findByIdAndUpdate(req.user.userId, { $push: { posts: post._id } }, { new: true });
    res.status(201).json({ message: 'Пост успішно створено', post });
  } catch (error) {
    res.status(500).json({ error: 'Не вдалося створити пост' });
  }
});


app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'name');
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Не вдалося отримати пости' });
  }
});


app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('posts');
    if (!user) return res.status(404).json({ error: 'Користувач не знайдений' });
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


app.post('/api/update-profile', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.user.userId, { name }, { new: true });
    if (!updatedUser) return res.status(404).json({ error: 'Користувач не знайдений' });
    res.status(200).json({ message: 'Профіль оновлено успішно', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Не вдалося оновити профіль' });
  }
});


app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { content, to } = req.body;
    const from = req.user.userId;
    const timestamp = new Date().toISOString();

    if (!content || !to || !from) {
      console.error('Дані для повідомлення відсутні:', { content, to, from });
      return res.status(400).json({ error: 'Всі поля мають бути заповнені' });
    }

    const newMessage = new Message({
      content,
      from: new mongoose.Types.ObjectId(from),
      to: new mongoose.Types.ObjectId(to),
      timestamp,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Помилка при збереженні повідомлення:', error);
    res.status(500).json({ error: 'Сталася помилка на сервері' });
  }
});


app.get('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    const messages = await Message.find({
      $or: [
        { from: req.user.userId, to: userId },
        { from: userId, to: req.user.userId },
      ],
    }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Не вдалося отримати повідомлення' });
  }
});

app.get('/api/chats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const chats = await Message.find({
      $or: [{ from: userId }, { to: userId }],
    })
      .populate('from', 'name') 
      .populate('to', 'name')   
      .exec();

    
    const uniqueChats = [];
    const seenUserIds = new Set();

    chats.forEach((chat) => {
      const isFromCurrentUser = chat.from && chat.from._id.toString() === userId;
      const otherUser = isFromCurrentUser ? chat.to : chat.from;

      
      if (otherUser && !seenUserIds.has(otherUser._id.toString())) {
        seenUserIds.add(otherUser._id.toString());
        uniqueChats.push({
          userId: otherUser._id,
          name: otherUser.name || 'Анонімний', 
        });
      }
    });

    res.status(200).json(uniqueChats);
  } catch (error) {
    console.error('Помилка при завантаженні чатів:', error);
    res.status(500).json({ error: 'Сталася помилка при завантаженні чатів' });
  }
});




app.get('/api/search-users', authenticateToken, async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'Введіть ім\'я для пошуку' });

    const users = await User.find({ name: { $regex: name, $options: 'i' } }).select('name email photoUrl');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Сталася помилка при пошуку користувачів' });
  }
});
app.post('/api/create-chat', authenticateToken, async (req, res) => {
  try {
    const { to } = req.body;
    const from = req.user.userId;

    if (!to || !from) {
      return res.status(400).json({ error: 'Відсутні обов’язкові дані для створення чату.' });
    }

    const existingChat = await Message.findOne({
      $or: [
        { from, to },
        { from: to, to: from },
      ],
    });

    if (existingChat) {
      return res.status(200).json({ message: 'Чат вже існує', chatId: existingChat._id });
    }

   
    const newChat = new Message({
      content: 'Чат створено', 
      from,
      to,
      timestamp: new Date(),
    });

    await newChat.save();

    res.status(201).json({ message: 'Чат створено успішно', chatId: newChat._id });
  } catch (error) {
    console.error('Помилка при створенні чату:', error.message);
    res.status(500).json({ error: 'Сталася помилка на сервері.' });
  }
});



app.delete('/api/delete-chat', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    const currentUserId = req.user.userId;

    
    await Message.deleteMany({
      $or: [
        { from: currentUserId, to: userId },
        { from: userId, to: currentUserId },
      ],
    });

    res.status(200).json({ message: 'Чат успішно видалено' });
  } catch (error) {
    console.error('Помилка при видаленні чату:', error);
    res.status(500).json({ error: 'Не вдалося видалити чат' });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущено на порту ${PORT}`));
