import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../styles/ChatPage.css';

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/messages?userId=${selectedChat}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(response.data);
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      } catch (error) {
        console.error('Помилка при завантаженні повідомлень:', error);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/messages',
        { content: newMessage, to: selectedChat },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages([...messages, response.data]);
      setNewMessage('');
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Помилка при відправленні повідомлення:', error);
    }
  };

  const handleClearMessage = () => {
    setNewMessage('');
  };

  return (
    <div className="chat-page-container">
      <div className="chat-list">
        {chats.map((chat) => (
          <div
            key={chat.userId}
            className={`chat-item ${selectedChat === chat.userId ? 'active' : ''}`}
            onClick={() => setSelectedChat(chat.userId)}
          >
            {chat.name}
          </div>
        ))}
      </div>
      <div className="chat-messages-container">
        {selectedChat ? (
          <>
            <div className="messages">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${
                    message.from === selectedChat ? 'received' : 'sent'
                  }`}
                >
                  <p>{message.content}</p>
                  <span className="timestamp">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="message-input-container">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Введіть повідомлення..."
                className="message-input"
              />
              <button
                className={`clear-button ${newMessage ? 'active' : ''}`}
                onClick={handleClearMessage}
              >
                <i className="fas fa-trash-alt"></i>
              </button>
              <button
                className={`send-button ${newMessage ? 'active' : ''}`}
                onClick={handleSendMessage}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
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
