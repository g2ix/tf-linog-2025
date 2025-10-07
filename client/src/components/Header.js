import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaImages, FaMap, FaNewspaper, FaCog } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isAdmin = localStorage.getItem('token');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo" onClick={closeMenu}>
            <img src="/logo.svg" alt="SVD-PHS Task Force Linog" className="logo-image" />
            <div className="logo-text">
              <h1>Earthquake Cebu</h1>
              <p>Disaster Response System</p>
            </div>
          </Link>
          
          <button className="menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={closeMenu}>
              <FaHome /> Home
            </Link>
            <Link to="/gallery" className={`nav-link ${location.pathname === '/gallery' ? 'active' : ''}`} onClick={closeMenu}>
              <FaImages /> Gallery
            </Link>
            <Link to="/map" className={`nav-link ${location.pathname === '/map' ? 'active' : ''}`} onClick={closeMenu}>
              <FaMap /> Map
            </Link>
            <Link to="/updates" className={`nav-link ${location.pathname === '/updates' ? 'active' : ''}`} onClick={closeMenu}>
              <FaNewspaper /> Updates
            </Link>
            {isAdmin ? (
              <>
                <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`} onClick={closeMenu}>
                  <FaCog /> Admin
                </Link>
                <button className="nav-link logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/admin" className="nav-link" onClick={closeMenu}>
                <FaCog /> Admin
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
