import React, { useEffect, useState } from 'react';
import '../styles/PostsPage.css'; 

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
        posts
          .slice(0)
          .reverse() 
          .map((post) => (
            <div className="post" key={post._id}>
              <h3 className="post-title">{post.title}</h3>
              <p className="post-description">{post.description}</p>
              {post.imageUrl && (
                <img src={post.imageUrl} alt={post.title} className="post-image" />
              )}
              <p className="post-author">Автор: {post.author.name}</p>
            </div>
          ))
      )}
    </div>
  );
};

export default PostsPage;
