import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import './navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const { user, isLoggedIn, logout } = useAuth(); // Changed from isAuthenticated to isLoggedIn
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = location.pathname.includes('/admin');
  const isStudent = location.pathname.includes('/student');

  // Handle scroll effect
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
        <li><Link to="/pricing">Pricing</Link></li>
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
          <li><Link to="/">Back to Home</Link></li>
        </ul>
      );
    } else if (isStudent) {
      return (
        <ul className="nav-links mobile-links">
          <li><Link to="/student/upcoming-sessions">Upcoming Sessions</Link></li>
          <li><Link to="/student/enrolled-courses">Enrolled Courses</Link></li>
          <li><Link to="/">Back to Home</Link></li>
        </ul>
      );
    } else {
      return (
        <ul className="nav-links mobile-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/courses">Courses</Link></li>
          <li><Link to="/pricing">Pricing</Link></li>
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
          {renderDesktopLinks()}
          <div className="auth-section">
            {isLoggedIn && user ? ( // Changed from isAuthenticated to isLoggedIn
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
                    <Link to="/dashboard" onClick={() => setIsDropdownOpen(false)}>Dashboard</Link>
                    <Link to="/profile" onClick={() => setIsDropdownOpen(false)}>Profile</Link>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="login-btn">Login</Link>
                <Link to="/register" className="signup-btn">Sign Up</Link>
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
            {isLoggedIn && user ? ( // Changed from isAuthenticated to isLoggedIn
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
                    <Link to="/dashboard" onClick={() => setIsDropdownOpen(false)}>Dashboard</Link>
                    <Link to="/profile" onClick={() => setIsDropdownOpen(false)}>Profile</Link>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" onClick={closeMenu} className="login-btn">Login</Link>
                <Link to="/register" onClick={closeMenu} className="signup-btn">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;