import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import Navbar from './components/Navbar';
import Register from './components/Register';
import Login from './components/Login';
import CreatePost from './components/CreatePost';
import PostsPage from './pages/PostsPage';
import ProfilePage from './pages/ProfilePage';
import SearchUser from './components/SearchUser';
import './styles/App.css';

const App = () => {
  return (
    <div className="container">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<PostsPage />} />
          <Route path="/chat/:userId" element={<ChatPage />} /> {}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/search" element={<SearchUser />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
