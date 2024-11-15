import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Імпортуємо useNavigate
import '../styles/SearchUser.css';

const SearchUser = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate(); // Використовуємо useNavigate для перенаправлення

  const handleSearch = async () => {
    const token = localStorage.getItem('token'); // Отримання токена з localStorage

    try {
      const response = await fetch(`http://localhost:5000/api/search-users?name=${searchTerm}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Додайте заголовок Authorization
        },
      });

      if (!response.ok) {
        throw new Error('Помилка: ' + response.status);
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Помилка при пошуку користувачів:', error);
    }
  };

  // Функція для обробки кліку на "Написати"
  const handleChat = (user) => {
    // Збережіть інформацію про вибраного користувача (можливо, у стані або localStorage)
    navigate(`/chat/${user._id}`); // Перенаправляємо на сторінку чату з вибраним користувачем
  };

  return (
    <div className="search-container">
      <h2>Пошук користувачів</h2>
      <input
        type="text"
        placeholder="Введіть ім'я користувача"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Пошук</button>
      <div className="user-results">
        {users.map((user) => (
          <div key={user._id} className="user-card">
            <p>{user.name}</p>
            <button onClick={() => handleChat(user)}>Написати</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchUser;
