import React, { useEffect, useState } from 'react';
import '../styles/PostsPage.css'; // Імпортуємо стилі
const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/posts');
        const data = await response.json();
        setPosts(data);
        setLoading(false);
      } catch (error) {
        console.error('Помилка при отриманні постів:', error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <p>Завантаження...</p>;

  return (
    <div className="posts-container">
      <h2>Пости</h2>
      {posts.length === 0 ? (
        <p>Немає постів для відображення.</p>
      ) : (
        posts.map((post) => (
          <div className="post" key={post._id}>
            <h3>{post.title}</h3>
            <p>{post.description}</p>
            {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="post-image" />}
            <p>Автор: {post.author.name}</p>
          </div>
        ))
      )}
    </div>
  );
  
};

export default PostsPage;

