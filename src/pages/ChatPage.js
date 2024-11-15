import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ChatPage.css';

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Завантаження унікальних чатів з іменами
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/chats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChats(response.data);
      } catch (error) {
        console.error('Помилка при завантаженні чатів:', error);
      }
    };

    fetchChats();
  }, []);

  // Завантаження повідомлень для вибраного чату
  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/messages?userId=${selectedChat.userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(response.data);
      } catch (error) {
        console.error('Помилка при завантаженні повідомлень:', error);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  // Функція для видалення чату
  const handleDeleteChat = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/delete-chat?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Оновлення списку чатів після видалення
      setChats(chats.filter(chat => chat.userId !== userId));
      if (selectedChat?.userId === userId) {
        setSelectedChat(null); // Скидання вибраного чату, якщо він був видалений
      }
    } catch (error) {
      console.error('Помилка при видаленні чату:', error);
    }
  };

  // Обробка відправлення нового повідомлення
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/messages',
        {
          content: newMessage,
          to: selectedChat.userId,
          timestamp: new Date().toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Помилка при відправленні повідомлення:', error);
    }
  };

  return (
    <div className="telegram-chat-container">
      <div className="chat-list">
        {chats.map((chat) => (
          <div key={chat.userId} className={`chat-item ${selectedChat?.userId === chat.userId ? 'active' : ''}`}>
            <span onClick={() => setSelectedChat(chat)}>{chat.name}</span>
            <button className="delete-button" onClick={() => handleDeleteChat(chat.userId)}>
              🗑️ Видалити
            </button>
          </div>
        ))}
      </div>
      <div className="chat-messages">
        {selectedChat ? (
          <>
            <div className="messages-header">Чат з користувачем {selectedChat.name}</div>
            <div className="messages">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.from === selectedChat.userId ? 'received' : 'sent'}`}
                >
                  <p>{message.content}</p>
                  <span className="timestamp">{new Date(message.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Введіть повідомлення..."
              />
              <button onClick={handleSendMessage}>Відправити</button>
            </div>
          </>
        ) : (
          <p>Виберіть чат для перегляду повідомлень</p>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
