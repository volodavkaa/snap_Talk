import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import Navbar from './components/Navbar';
import Register from './components/Register';
import Login from './components/Login';
import Post from './components/Post'; 
import './styles/App.css';

const App = () => {
  return (
    <div className="container">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/posts" element={<Post />} /> {}
        </Routes>
      </Router>
    </div>
  );
};

export default App;
