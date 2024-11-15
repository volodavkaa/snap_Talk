import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../styles/Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Користувача успішно створено!');
        
        setTimeout(() => {
          navigate('/login'); 
        }, 2000); 
      } else {
        setMessage(data.error || 'Сталася помилка');
      }
    } catch (error) {
      setMessage('Сталася помилка сервера');
    }
  };

  return (
    <div className="register-container">
      <div className="register-logo">SnapTalk</div>
      <div className="register-form">
        <h2 className="register-title">Реєстрація</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Ім'я:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Електронна пошта:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button">Зареєструватися</button>
        </form>
        {message && <p className="auth-message">{message}</p>}
        <p className="auth-link">
          Уже маєте акаунт? <a href="/login">Авторизація</a>
        </p>
      </div>
    </div>
  );
};

export default Register;

