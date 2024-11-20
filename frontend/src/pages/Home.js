import React from 'react';
import '../styles/Home.css';

const Home = () => {
  const posts = [
    { id: 1, image: 'https://via.placeholder.com/150', title: 'Подорож до гір' },
    { id: 2, image: 'https://via.placeholder.com/150', title: 'Смачний обід' },
    { id: 3, image: 'https://via.placeholder.com/150', title: 'Мій улюблений кіт' },
    { id: 4, image: 'https://via.placeholder.com/150', title: 'Вечірка на заході' },
  ];

  return (
    <div className="home">
      <h1>Останні Пости</h1>
      <div className="posts-grid">
        {posts.map((post) => (
          <div key={post.id} className="post">
            <img src={post.image} alt={post.title} />
            <h3>{post.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
