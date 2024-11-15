import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Перевіряємо, чи ми вже на сторінці логіну, щоб уникнути циклу
  React.useEffect(() => {
    if (!token && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [token, location, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <div className="navbar-container">
      <div className="logo">SnapTalk</div>
      <ul className="nav-links">
        <li>
          <Link to="/posts">
            <i className="fas fa-file-alt"></i> Пости
          </Link>
        </li>
        <li>
          <Link to="/chat">
            <i className="fas fa-comments"></i> Чат
          </Link>
        </li>
        <li>
          <Link to="/create-post">
            <i className="fas fa-plus-circle"></i> Створити пост
          </Link>
        </li>
        <li>
          <Link to="/profile">
            <i className="fas fa-user-circle"></i> Профіль
          </Link>
        </li>
      </ul>
      {token && (
        <button className="logout-button" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Вихід
        </button>
      )}
    </div>
  );
};

export default Navbar;
