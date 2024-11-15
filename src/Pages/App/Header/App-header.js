import './App-header.css';
import { useNavigate } from 'react-router-dom';
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
                <button className="button" onClick={() => handleNavigation('/')}>
                    <span className="actual-text">&nbsp;Accueil&nbsp;</span>
                    <span aria-hidden="true" className="hover-text">&nbsp;Accueil&nbsp;</span>
                </button>
                <button className="button" onClick={() => handleNavigation('/Inscription')}>
                    <span className="actual-text">&nbsp;Inscription&nbsp;</span>
                    <span aria-hidden="true" className="hover-text">&nbsp;Inscription&nbsp;</span>
                </button>
                <button className="button" onClick={() => handleNavigation('/About')}>
                    <span className="actual-text">&nbsp;À&nbsp;propos&nbsp;</span>
                    <span aria-hidden="true" className="hover-text">&nbsp;À&nbsp;propos&nbsp;</span>
                </button>
            </div>
        </div>
    );
}

export default AppHeader;