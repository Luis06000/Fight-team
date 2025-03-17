import React, { useState } from 'react';
import PageTitle from '../../components/common/PageTitle/PageTitle';
import { sendRegistration } from '../../services/RegistrationService';
import './Registration.css';

const Registration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    motivation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await sendRegistration(formData);
      setSubmitStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        birthDate: '',
        email: '',
        motivation: ''
      });
    } catch (error) {
      setSubmitStatus('error');
      console.error('Erreur lors de l\'envoi du formulaire:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="registration-page">
      <PageTitle title="Inscription" emoji="📜" />
      
      <div className="form-container">
        {submitStatus === 'success' && (
          <div className="alert success">
            Données envoyées avec succès !
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="alert error">
            Problème lors de l'envoi des données. Veuillez réessayer.
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">Prénom:</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Nom:</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="birthDate">Date de naissance:</label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="motivation">Lettre de motivation:</label>
            <textarea
              id="motivation"
              name="motivation"
              value={formData.motivation}
              onChange={handleChange}
              required
              minLength={50}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? 'Envoi en cours...' : 'S\'inscrire'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;
