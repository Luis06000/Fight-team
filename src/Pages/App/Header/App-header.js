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
                    <span className="actual-text">&nbsp;home&nbsp;</span>
                    <span aria-hidden="true" className="hover-text">&nbsp;home&nbsp;</span>
                </button>
                <button className="button" onClick={() => handleNavigation('/projects')}>
                    <span className="actual-text">&nbsp;projects&nbsp;</span>
                    <span aria-hidden="true" className="hover-text">&nbsp;projects&nbsp;</span>
                </button>
                <button className="button" onClick={() => handleNavigation('/about')}>
                    <span className="actual-text">&nbsp;about&nbsp;</span>
                    <span aria-hidden="true" className="hover-text">&nbsp;about&nbsp;</span>
                </button>
            </div>
        </div>
    );
}

export default AppHeader;