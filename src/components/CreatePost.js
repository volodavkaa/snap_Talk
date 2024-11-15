import React, { useState } from 'react';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
  
    console.log('Title:', title); // Перевірте, чи значення зчитуються
    console.log('Description:', description); // Перевірте, чи значення зчитуються
  
    if (!title || !description) {
      setMessage('Будь ласка, заповніть всі поля');
      return;
    }
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (image) {
      formData.append('image', image);
    }
  
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (response.ok) {
        setMessage('Пост успішно створено!');
        setTitle('');
        setDescription('');
        setImage(null);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Не вдалося створити пост');
      }
    } catch (error) {
      setMessage('Сталася помилка сервера');
    }
  };
  
  
  
  
  
  

  return (
    <div className="create-post-container">
      <h2>Створити пост</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Заголовок:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Опис:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <label>Зображення:</label>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <button type="submit">Створити пост</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreatePost;
