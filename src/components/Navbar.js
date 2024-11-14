import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <nav>
      <div className="logo">SnapTalk</div>
      <ul>
        <li><Link to="/posts">Пости</Link></li>
        <li><Link to="/chat">Чат</Link></li>
        {!token ? (
          <>
            <li><Link to="/register">Реєстрація</Link></li>
            <li><Link to="/login">Авторизація</Link></li>
          </>
        ) : (
          <li><button onClick={handleLogout}>Вихід</button></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
