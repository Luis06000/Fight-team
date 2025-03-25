import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import PageTitle from '../../components/common/PageTitle/PageTitle';
import './Profile.css';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUserData() {
      if (!currentUser) return;

      try {
        setLoading(true);
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setUserData({
            id: userDoc.id,
            ...userDoc.data()
          });
        } else {
          // Si le document n'existe pas, utiliser les données de base de l'authentification
          setUserData({
            email: currentUser.email,
            displayName: currentUser.displayName || 'Utilisateur',
            photoURL: currentUser.photoURL
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données utilisateur:", error);
        setError("Impossible de charger vos informations. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      // La redirection sera gérée par le composant (Navigate)
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      setError("Impossible de vous déconnecter. Veuillez réessayer.");
    }
  };

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="profile-page">
      <PageTitle title="Mon Profil" emoji="👤" />
      
      <div className="profile-container">
        {userData?.role && (
          <div className="profile-role-badge">
            {userData.role === 'admin' ? 'Administrateur' : 
             userData.role === 'coach' ? `Coach ${userData.coachDomain}` : 
             'Membre'}
          </div>
        )}
        
        {loading ? (
          <div className="loading-profile">Chargement de votre profil...</div>
        ) : error ? (
          <div className="profile-error-message">{error}</div>
        ) : (
          <div className="profile-content">
            <div className="profile-header">
              <div className="profile-avatar">
                {userData?.photoURL ? (
                  <img src={userData.photoURL} alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {userData?.displayName?.charAt(0) || userData?.email?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div className="profile-info">
                <h2>{userData?.displayName || 'Utilisateur'}</h2>
                <p className="profile-email">{userData?.email}</p>
              </div>
            </div>

            <div className="profile-details">
              <div className="profile-section">
                <h3>Informations personnelles</h3>
                <div className="profile-field">
                  <span className="field-label">Email:</span>
                  <span className="field-value">{userData?.email}</span>
                </div>
                {userData?.phone && (
                  <div className="profile-field">
                    <span className="field-label">Téléphone:</span>
                    <span className="field-value">{userData.phone}</span>
                  </div>
                )}
                {userData?.createdAt && (
                  <div className="profile-field">
                    <span className="field-label">Membre depuis:</span>
                    <span className="field-value">
                      {new Date(userData.createdAt.toDate()).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>

              {userData?.sports && userData.sports.length > 0 && (
                <div className="profile-section">
                  <h3>Sports pratiqués</h3>
                  <div className="profile-sports-list">
                    {userData.sports.map((sport, index) => (
                      <span key={index} className="profile-sport-tag">{sport}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="profile-actions">
              <button className="logout-button" onClick={handleLogout}>
                Se déconnecter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 