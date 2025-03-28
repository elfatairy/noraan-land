import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import './navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const { user, isLoggedIn, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = true;

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLinkClick = () => {
    closeMenu();
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const renderDesktopLinks = () => {
    return (
      <ul className="nav-links desktop-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/courses">Courses</Link></li>
      </ul>
    );
  };

  const renderMobileLinks = () => {
    if (isAdmin) {
      return (
        <ul className="nav-links mobile-links">
          <li><Link to="/admin/upcoming-sessions">Upcoming Sessions</Link></li>
          <li><Link to="/admin/calendar">Calendar</Link></li>
          <li><Link to="/admin/courses-management">Courses</Link></li>
          <li><Link to="https://nooranland.com">nooranland.com</Link></li>
        </ul>
      );
    } else {
      return (
        <ul className="nav-links mobile-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/courses">Courses</Link></li>
        </ul>
      );
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      {isMenuOpen && <div className="nav-overlay" onClick={closeMenu}></div>}
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/">
            <img src="/images/logo-no-bg.png" alt="Logo" />
          </Link>
        </div>

        <button className="hamburger" onClick={toggleMenu}>
          <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Desktop Navigation */}
        <div className="nav-content desktop">
          {/* {renderDesktopLinks()} */}
          <div className="auth-section">
            {isLoggedIn && user ? (
              <div className="user-menu">
                <button className="user-button" onClick={toggleDropdown}>
                  <span>{user.name}</span>
                  <svg
                    className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="dropdown-menu">

                    <Link to="/admin/upcoming-sessions">Dashboard</Link>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/admin/login" className="login-btn">Login</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`nav-content mobile ${isMenuOpen ? 'show' : ''}`}>
          <ul className="nav-links" onClick={handleLinkClick}>
            {renderMobileLinks()}
          </ul>
          <div className="auth-section">
            {isLoggedIn && user ? (
              <div className="user-menu">
                <button className="user-button" onClick={toggleDropdown}>
                  <span>{user.name}</span>
                  <svg
                    className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/admin/login" onClick={closeMenu} className="login-btn">Login</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;