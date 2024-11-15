import React, { useEffect, useState } from 'react';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:5000/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Помилка: ' + response.status);
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Помилка при отриманні даних:', error);
      }
    };

    fetchUser();
  }, []);

  if (!user) return <p>Завантаження...</p>;

  return (
    <div className="profile-container">
      <h2>Профіль</h2>
      <img
        src={user.photoUrl || 'default-profile-photo.jpg'}
        alt="Фото профілю"
        className="profile-photo"
      />
      <p>Ім'я: {user.name || 'Ім\'я не вказане'}</p>
      <p>Email: {user.email}</p>
      <p>Дата створення: {new Date(user.createdAt).toLocaleDateString()}</p>
      <h3>Пости користувача</h3>
      {user.posts && user.posts.length > 0 ? (
  user.posts.map((post, index) => (
    <div key={index} className="post">
      <h4>{post.title}</h4>
      <p>{post.description}</p>
      {post.imageUrl && <img src={post.imageUrl} alt="Фото посту" />}
    </div>
  ))
) : (
  <p>У користувача немає постів.</p>
)}

    </div>
  );
};

export default ProfilePage;
