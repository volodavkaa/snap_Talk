import React, { useState } from 'react';
import '../styles/CreatePost.css'; // Підключення стилів

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

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
        setImagePreview(null);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Не вдалося створити пост');
      }
    } catch (error) {
      setMessage('Сталася помилка сервера');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleChangeImage = () => {
    document.getElementById('imageInput').click();
  };

  return (
    <div className="create-post-modern-container">
      <div className="create-post-card">
        <h2 className="create-post-title">Створити пост</h2>
        <form className="create-post-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Введіть заголовок..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="modern-input"
            />
          </div>
          <div className="input-group">
            <textarea
              placeholder="Напишіть опис..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="modern-textarea"
            ></textarea>
          </div>
          <div className="image-upload-container">
            <label className="image-upload-modern">
              <i className="fas fa-upload"></i> Додати фото
              <input
                type="file"
                id="imageInput"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>
            {imagePreview && (
              <div className="image-preview-container">
                <img
                  src={imagePreview}
                  alt="Попередній перегляд"
                  className="image-preview"
                />
                <div className="image-overlay">
                  <button className="image-action-button" onClick={handleChangeImage}>
                    <i className="fas fa-camera"></i> {/* Іконка для зміни */}
                  </button>
                  <button className="image-action-button" onClick={handleRemoveImage}>
                    <i className="fas fa-trash-alt"></i> {/* Іконка для видалення */}
                  </button>
                </div>
              </div>
            )}
          </div>
          <button className="modern-submit-button" type="submit">
            Поділитися
          </button>
        </form>
        {message && <p className="modern-message">{message}</p>}
      </div>
    </div>
  );
};

export default CreatePost;
