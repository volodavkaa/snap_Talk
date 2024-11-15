import React, { useEffect, useState } from 'react';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]); // Ініціалізуйте як порожній масив

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:5000/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Помилка при отриманні даних:', error);
      }
    };

    const fetchPosts = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:5000/api/posts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setPosts(data); // Оновлюємо стейт постів
      } catch (error) {
        console.error('Помилка при отриманні постів:', error);
      }
    };

    fetchUser();
    fetchPosts();
  }, []);

  if (!user) return <p>Завантаження...</p>;

  return (
    <div className="profile-container">
      <h2>Профіль</h2>
      <p>Ім'я: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Дата створення: {new Date(user.createdAt).toLocaleDateString()}</p>
      <h3>Пости користувача</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post._id}>
            <h4>{post.title}</h4>
            <p>{post.description}</p>
          </div>
        ))
      ) : (
        <p>Немає постів</p>
      )}
    </div>
  );
};

export default ProfilePage;
