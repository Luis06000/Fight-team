import React from 'react';
import { FaMedal, FaHandshake, FaHeart, FaUsers } from 'react-icons/fa';
import PageTitle from '../../components/common/PageTitle/PageTitle';
import './About.css';

const About = () => {
    const values = [
        {
            icon: <FaMedal />,
            title: "Excellence",
            description: "Nous visons l'excellence dans chaque aspect de notre pratique martiale"
        },
        {
            icon: <FaHandshake />,
            title: "Respect",
            description: "Le respect mutuel est au cœur de notre philosophie"
        },
        {
            icon: <FaHeart />,
            title: "Passion",
            description: "Notre passion pour les arts martiaux guide chacune de nos actions"
        },
        {
            icon: <FaUsers />,
            title: "Communauté",
            description: "Nous construisons une communauté forte et solidaire"
        }
    ];

    return (
        <div className="about-page">
            <PageTitle title="À propos" emoji="ℹ️" />
            
            <div className="about-content">
                <div className="mission-section">
                    <h2>Notre Mission</h2>
                    <p className="highlight-text">
                        Créer une communauté sportive dynamique au sein du CESI à travers les arts martiaux
                    </p>
                </div>

                <div className="values-section">
                    <h2>Nos Valeurs</h2>
                    <div className="values-grid">
                        {values.map((value, index) => (
                            <div key={index} className="value-card">
                                <div className="value-icon">{value.icon}</div>
                                <h3>{value.title}</h3>
                                <p>{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="objectives-section">
                    <h2>Nos Objectifs</h2>
                    <div className="objectives-list">
                        <div className="objective-item">
                            <h3>Initiation aux Arts Martiaux</h3>
                            <p>Proposer des séances d'initiation adaptées à tous les niveaux</p>
                        </div>
                        <div className="objective-item">
                            <h3>Self-Défense</h3>
                            <p>Sensibiliser les étudiants à la self-défense et développer leur confiance en soi</p>
                        </div>
                        <div className="objective-item">
                            <h3>Bien-être</h3>
                            <p>Lutter contre la sédentarité en encourageant la pratique sportive régulière</p>
                        </div>
                    </div>
                </div>

                <div className="join-section">
                    <h2>Rejoignez l'Aventure</h2>
                    <p>
                        Notre projet inclut l'organisation d'événements, la création de supports de communication 
                        et la mise en place d'un système d'inscription pour faciliter l'accès à nos activités.
                        Nous sommes impatients de vous accueillir et de partager cette aventure avec vous !
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;