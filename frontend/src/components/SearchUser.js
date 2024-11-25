import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SearchUser.css';
import axios from 'axios'; 

const SearchUser = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('userId');

  
  const handleChat = async (user) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:5000/api/create-chat',
        { to: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201 || response.status === 200) {
        navigate(`/chat/${user._id}`); 
      }
    } catch (error) {
      console.error('Не вдалося створити чат:', error);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setUsers([]); 
      return;
    }

    const fetchUsers = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`http://localhost:5000/api/search-users?name=${searchTerm}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Помилка: ' + response.status);
        }

        const data = await response.json();
        const filteredUsers = data.filter(user => user._id !== currentUserId);
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Помилка при пошуку користувачів:', error);
      }
    };

    fetchUsers();
  }, [searchTerm, currentUserId]);

  return (
    <div className="search-container">
      <h2>Пошук користувачів</h2>
      <input
        type="text"
        placeholder="Введіть ім'я користувача"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="user-results">
        {users.map((user) => (
          <div key={user._id} className="user-card">
            <p>{user.name}</p>
            <button onClick={() => handleChat(user)}>Написати</button> {}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchUser;
