import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Vérifier si l'utilisateur est un administrateur
  useEffect(() => {
    async function checkAdminStatus() {
      if (!currentUser) {
        setIsAdmin(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des droits d'admin:", error);
        setIsAdmin(false);
      }
    }

    checkAdminStatus();
  }, [currentUser]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <nav className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        <Link className="nav-button" to="/" onClick={() => handleNavigation('/')}>
          <span className="actual-text">&nbsp;Accueil&nbsp;</span>
          <span aria-hidden="true" className="hover-text">&nbsp;Accueil&nbsp;</span>
        </Link>
        {!currentUser && (
          <Link className="nav-button" to="/inscription" onClick={() => handleNavigation('/inscription')}>
            <span className="actual-text">&nbsp;Inscription&nbsp;</span>
            <span aria-hidden="true" className="hover-text">&nbsp;Inscription&nbsp;</span>
          </Link>
        )}
        <Link className="nav-button" to="/a-propos" onClick={() => handleNavigation('/a-propos')}>
          <span className="actual-text">&nbsp;À&nbsp;propos&nbsp;</span>
          <span aria-hidden="true" className="hover-text">&nbsp;À&nbsp;propos&nbsp;</span>
        </Link>
        {currentUser && (
          <Link className="nav-button" to="/cours" onClick={() => handleNavigation('/cours')}>
            <span className="actual-text">&nbsp;Cours&nbsp;</span>
            <span aria-hidden="true" className="hover-text">&nbsp;Cours&nbsp;</span>
          </Link>
        )}
        {isAdmin && (
          <Link className="nav-button admin-link" to="/admin" onClick={() => handleNavigation('/admin')}>
            <span className="actual-text">&nbsp;Admin&nbsp;</span>
            <span aria-hidden="true" className="hover-text">&nbsp;Admin&nbsp;</span>
          </Link>
        )}
      </nav>
      
      <div className="auth-icon" onClick={() => handleNavigation(currentUser ? '/profil' : '/login')}>
        <FaUser />
        <div className="auth-status">{currentUser ? '•' : ''}</div>
      </div>
    </header>
  );
};

export default Header;