import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Імпортуємо Link з react-router-dom
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Успішний вхід!');
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId); // Збереження userId в localStorage

        setTimeout(() => {
          navigate('/'); // Перенаправлення на головну сторінку
        }, 1000);
      } else {
        setMessage(data.error || 'Неправильна електронна пошта або пароль');
      }
    } catch (error) {
      setMessage('Сталася помилка сервера');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background"></div>
      <div className="auth-wrapper">
        <div className="logo">SnapTalk</div>
        <h2 className="auth-title">Авторизація</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Електронна пошта:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Пароль:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button">Увійти</button>
        </form>
        {message && <p className="auth-message">{message}</p>}
        <div className="auth-link">
          Немає акаунту? <Link to="/register">Реєстрація</Link> {}
        </div>
      </div>
    </div>
  );
};

export default Login;
