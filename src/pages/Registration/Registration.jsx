import React, { useState } from 'react';
import PageTitle from '../../components/common/PageTitle/PageTitle';
import { sendRegistration } from '../../services/RegistrationService';
import './Registration.css';

const Registration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    membershipType: 'adherent',
    skills: '',
    availability: [],
    motivation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const getFieldError = (fieldName) => {
    if (!touched[fieldName]) return '';
    
    switch(fieldName) {
      case 'firstName':
      case 'lastName':
        return formData[fieldName].trim() === '' ? 'Ce champ est obligatoire' : '';
      case 'email':
        return formData.email.trim() === '' ? 'L\'email est obligatoire' : '';
      case 'phone':
        return formData.phone.trim() === '' ? 'Le téléphone est obligatoire' : '';
      case 'birthDate':
        return formData.birthDate === '' ? 'La date de naissance est obligatoire' : '';
      case 'motivation':
        return formData.motivation.trim() === '' ? 'La motivation est obligatoire' : '';
      default:
        return '';
    }
  };

  const validateStep = (step) => {
    switch(step) {
      case 1:
        return (
          formData.firstName.trim() !== '' &&
          formData.lastName.trim() !== '' &&
          formData.birthDate !== '' &&
          formData.email.trim() !== '' &&
          formData.phone.trim() !== ''
        );
      case 2:
        // Étape 2 n'a pas de champs obligatoires
        return true;
      case 3:
        return (
          formData.membershipType !== '' &&
          formData.motivation.trim() !== ''
        );
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
    } else {
      alert('Veuillez remplir tous les champs obligatoires avant de continuer.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      birthDate: '',
      email: '',
      phone: '',
      address: '',
      postalCode: '',
      city: '',
      membershipType: 'adherent',
      skills: '',
      availability: [],
      motivation: ''
    });
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await sendRegistration(formData);
      setSubmitStatus('success');
      resetForm();
      document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du formulaire:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const RequiredStar = () => <span className="required-star">*</span>;

  const renderField = (name, label, type = 'text', required = false) => (
    <div className="form-group">
      <label htmlFor={name}>{label}{required && <RequiredStar />}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        onBlur={handleBlur}
        required={required}
      />
      {required && <span className="error-message">{getFieldError(name)}</span>}
    </div>
  );

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="form-section">
            <h3>Informations Personnelles</h3>
            <div className="form-row">
              {renderField('firstName', 'Prénom', 'text', true)}
              {renderField('lastName', 'Nom', 'text', true)}
            </div>
            <div className="form-row">
              {renderField('birthDate', 'Date de naissance', 'date', true)}
              {renderField('email', 'Email', 'email', true)}
            </div>
            {renderField('phone', 'Téléphone', 'tel', true)}
          </div>
        );

      case 2:
        return (
          <div className="form-section">
            <h3>Adresse</h3>
            {renderField('address', 'Adresse')}
            <div className="form-row">
              {renderField('postalCode', 'Code Postal')}
              {renderField('city', 'Ville')}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-section">
            <h3>Participation</h3>
            <div className="form-group">
              <label htmlFor="membershipType">Type d'adhésion<RequiredStar /></label>
              <select
                id="membershipType"
                name="membershipType"
                value={formData.membershipType}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              >
                <option value="adherent">Adhérent</option>
                <option value="benevole">Bénévole</option>
                <option value="donateur">Donateur</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="skills">Compétences ou centres d'intérêt</label>
              <textarea
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="Partagez vos compétences ou centres d'intérêt qui pourraient enrichir l'association"
              />
            </div>

            <div className="form-group">
              <label>Disponibilités</label>
              <div className="checkbox-group">
                {['Matin', 'Après-midi', 'Soir', 'Week-end'].map(time => (
                  <label key={time} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="availability"
                      value={time}
                      checked={formData.availability.includes(time)}
                      onChange={(e) => {
                        const newAvailability = e.target.checked
                          ? [...formData.availability, time]
                          : formData.availability.filter(t => t !== time);
                        setFormData({...formData, availability: newAvailability});
                      }}
                    />
                    {time}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="motivation">Motivation<RequiredStar /></label>
              <textarea
                id="motivation"
                name="motivation"
                value={formData.motivation}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="Pourquoi souhaitez-vous rejoindre notre association ?"
              />
              <span className="error-message">{getFieldError('motivation')}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="registration-page">
      <PageTitle title="Devenir Membre" emoji="🤝" />
      
      <div className="form-container">
        <div className="steps-indicator">
          {[1, 2, 3].map(step => (
            <div
              key={step}
              className={`step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
            >
              {step}
            </div>
          ))}
        </div>

        {submitStatus === 'success' && (
          <div className="alert success">
            <p>✅ Votre demande d'adhésion a été envoyée avec succès !</p>
            <p>Nous vous contacterons très prochainement.</p>
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="alert error">
            <p>❌ Une erreur est survenue lors de l'envoi.</p>
            <p>Veuillez réessayer ou nous contacter directement.</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {renderStep()}
          
          <div className="form-navigation">
            <div className="nav-left">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="form-nav-button prev"
                >
                  Précédent
                </button>
              )}
            </div>
            
            <div className="nav-right">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="form-nav-button next"
                  disabled={!validateStep(currentStep)}
                >
                  Suivant
                </button>
              ) : (
                <button 
                  type="submit"
                  disabled={isSubmitting || !validateStep(currentStep)}
                  className="form-submit-button"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande d\'adhésion'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registration;
