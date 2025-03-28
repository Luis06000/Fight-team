import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaGithub, FaDiscord, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useState, useEffect } from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

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

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Plan du site</h3>
          <nav className="footer-nav">
            <Link to="/">Accueil</Link>
            {currentUser && <Link to="/cours">Cours</Link>}
            <Link to="/inscription">Inscription</Link>
            <Link to="/a-propos">À propos</Link>
            {isAdmin && <Link to="/admin" className="admin-link">Administration</Link>}
          </nav>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <a href="mailto:fightteam.contact06@gmail.com" className="contact-link">
            <FaEnvelope />
            <span>fightteam.contact06@gmail.com</span>
          </a>
        </div>

        <div className="footer-section">
          <h3>Suivez-nous</h3>
          <div className="social-links">
            <a 
              href="https://www.instagram.com/cesifightteam?igsh=eDF3a3FrOHhuNjF1" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-link instagram"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a 
              href="https://github.com/Luis06000/Fight-team" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-link github"
              aria-label="GitHub"
            >
              <FaGithub />
            </a>
            <a 
              href="https://discord.gg/yc49Jv5Ffq"
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-link discord"
              aria-label="Discord"
            >
              <FaDiscord />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Fight Team. Tous droits réservés.</p>
      </div>
    </footer>
  );
};

export default Footer;
