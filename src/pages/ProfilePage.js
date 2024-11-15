import React, { useEffect, useState } from 'react';

const ProfilePage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUser(data);
    };

    fetchUser();
  }, []);

  if (!user) return <p>Завантаження...</p>;

  return (
    <div className="profile-container">
      <h2>Профіль</h2>
      <p>Ім'я: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Дата створення: {new Date(user.createdAt).toLocaleDateString()}</p>
    </div>
  );
};

export default ProfilePage;
