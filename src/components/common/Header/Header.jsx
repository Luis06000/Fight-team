import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : 'auto';
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <button 
        className={`hamburger ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        <Link className="nav-button" to="/" onClick={() => handleNavigation('/')}>
          <span className="actual-text">&nbsp;Accueil&nbsp;</span>
          <span aria-hidden="true" className="hover-text">&nbsp;Accueil&nbsp;</span>
        </Link>
        <Link className="nav-button" to="/inscription" onClick={() => handleNavigation('/inscription')}>
          <span className="actual-text">&nbsp;Inscription&nbsp;</span>
          <span aria-hidden="true" className="hover-text">&nbsp;Inscription&nbsp;</span>
        </Link>
        <Link className="nav-button" to="/a-propos" onClick={() => handleNavigation('/a-propos')}>
          <span className="actual-text">&nbsp;À&nbsp;propos&nbsp;</span>
          <span aria-hidden="true" className="hover-text">&nbsp;À&nbsp;propos&nbsp;</span>
        </Link>
      </nav>
    </header>
  );
};

export default Header;