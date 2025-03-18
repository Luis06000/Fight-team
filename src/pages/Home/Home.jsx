import React from 'react';
import { FaBell } from 'react-icons/fa';
import PageTitle from '../../components/common/PageTitle/PageTitle';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <PageTitle title="Bienvenue" emoji="👋" />
      
      <div className="content-wrapper">
        <div className="intro-text">
          <div className="bell-icon">
            <FaBell />
          </div>
          <div className="separator"></div>
          <p>Les inscriptions sont d'ores et déjà ouvertes, nous prendrons contact avec vous d'ici peu !</p>
        </div>

        <div className="features-section">
          <h2>Nos Services Principaux</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Inscription Simplifiée</h3>
              <p>Processus d'inscription rapide et intuitif</p>
            </div>
            <div className="feature-card">
              <h3>Suivi Personnalisé</h3>
              <p>Accompagnement adapté à vos besoins</p>
            </div>
            <div className="feature-card">
              <h3>Support 24/7</h3>
              <p>Une équipe à votre écoute</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
