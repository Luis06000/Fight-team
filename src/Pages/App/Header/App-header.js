import './App-header.css';
import { useNavigate, Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

function AppHeader() {
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

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        document.body.style.overflow = !isMenuOpen ? 'hidden' : 'auto';
    };

    useEffect(() => {
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const handleNavigation = (path) => {
        navigate(path);
        setIsMenuOpen(false);
        document.body.style.overflow = 'auto';
    };

    return (
        <div className={`App-header ${isScrolled ? 'scrolled' : ''}`}>
            <button 
                className={`hamburger ${isMenuOpen ? 'active' : ''}`}
                onClick={toggleMenu}
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                <Link className="button" to="/">
                    <span className="actual-text">&nbsp;Accueil&nbsp;</span>
                    <span aria-hidden="true" className="hover-text">&nbsp;Accueil&nbsp;</span>
                </Link>
                <Link className="button" to="/Inscription">
                    <span className="actual-text">&nbsp;Inscription&nbsp;</span>
                    <span aria-hidden="true" className="hover-text">&nbsp;Inscription&nbsp;</span>
                </Link>
                <Link className="button" to="/About">
                    <span className="actual-text">&nbsp;À&nbsp;propos&nbsp;</span>
                    <span aria-hidden="true" className="hover-text">&nbsp;À&nbsp;propos&nbsp;</span>
                </Link>
            </div>
        </div>
    );
}

export default AppHeader;