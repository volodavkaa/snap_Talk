import React, { useEffect, useState } from 'react';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState(null);

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
        setNewName(data.name); // Встановлюємо поточне ім'я
      } catch (error) {
        console.error('Помилка при отриманні даних:', error);
      }
    };

    fetchUser();
  }, []);

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const closePostDetails = () => {
    setSelectedPost(null);
  };

  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatar(file);
    }
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');

      // Зберігаємо нове ім'я
      const response = await fetch('http://localhost:5000/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error('Не вдалося зберегти зміни профілю');
      }

      // Зберігаємо новий аватар, якщо вибрано
      if (newAvatar) {
        const formData = new FormData();
        formData.append('image', newAvatar);

        const avatarResponse = await fetch(
          'http://localhost:5000/api/upload-avatar',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!avatarResponse.ok) {
          throw new Error('Не вдалося завантажити аватар');
        }

        const avatarData = await avatarResponse.json();
        setUser((prevUser) => ({ ...prevUser, photoUrl: avatarData.imageUrl }));
      }

      setUser((prevUser) => ({ ...prevUser, name: newName }));
      setEditing(false);
    } catch (error) {
      console.error('Помилка при збереженні змін:', error);
    }
  };

  if (!user) return <p>Завантаження...</p>;

  return (
    <div className="profile-container">
      <h2>Профіль</h2>
      <div className="avatar-container">
        <img
          src={user.photoUrl || 'default-profile-photo.jpg'}
          alt="Фото профілю"
          className="profile-photo"
        />
        {editing ? (
          <>
            <input type="file" onChange={handleAvatarChange} />
            <input
              type="text"
              value={newName}
              onChange={handleNameChange}
              placeholder="Нове ім'я"
            />
            <button onClick={handleSaveProfile}>Зберегти</button>
          </>
        ) : (
          <>
            <p>Ім'я: {user.name}</p>
            <p>Email: {user.email}</p>
            <p>Дата створення: {new Date(user.createdAt).toLocaleDateString()}</p>
            <button className="edit-profile-button" onClick={handleEditProfile}>
              Змінити профіль
            </button>
          </>
        )}
      </div>

      <h3>Пости користувача</h3>
      <div className="posts-grid">
        {user.posts.map((post, index) => (
          <div
            key={index}
            className="post-thumbnail"
            onClick={() => handlePostClick(post)}
          >
            <img src={post.imageUrl} alt="Фото посту" />
          </div>
        ))}
      </div>

      {selectedPost && (
        <div className="post-details-overlay" onClick={closePostDetails}>
          <div className="post-details" onClick={(e) => e.stopPropagation()}>
            <h4>{selectedPost.title}</h4>
            <p>{selectedPost.description}</p>
            <img src={selectedPost.imageUrl} alt="Фото посту" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
