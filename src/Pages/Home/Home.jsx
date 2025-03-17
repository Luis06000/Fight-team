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
      </div>
    </div>
  );
};

export default Home;
