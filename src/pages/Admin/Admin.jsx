import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  getAuth, 
  deleteUser,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { db, firebaseConfig } from '../../firebase';
import PageTitle from '../../components/common/PageTitle/PageTitle';
import { FaTimes, FaEdit } from 'react-icons/fa';
import './Admin.css';

// Créer une seconde instance Firebase pour les opérations d'administration
const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);

const Admin = () => {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [editError, setEditError] = useState('');
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'member',
    sports: []
  });
  const [editUser, setEditUser] = useState({
    displayName: '',
    role: 'member',
    sports: []
  });
  const [availableSports, setAvailableSports] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Vérifier si l'utilisateur actuel est un administrateur
  useEffect(() => {
    async function checkAdminStatus() {
      if (!currentUser) return;

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
          fetchUsers();
          fetchSports();
        } else {
          setIsAdmin(false);
          setError("Vous n'avez pas les droits d'administration nécessaires.");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des droits d'admin:", error);
        setError("Une erreur est survenue lors de la vérification de vos droits.");
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [currentUser]);

  // Récupérer la liste des utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      setError("Impossible de charger la liste des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  // Récupérer la liste des sports disponibles
  const fetchSports = async () => {
    try {
      const sportsCollection = collection(db, 'cours');
      const sportsSnapshot = await getDocs(sportsCollection);
      const sportsList = sportsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.id.charAt(0).toUpperCase() + doc.id.slice(1)
      }));
      setAvailableSports(sportsList);
    } catch (error) {
      console.error("Erreur lors du chargement des sports:", error);
    }
  };

  // Gérer les changements dans le formulaire d'ajout d'utilisateur
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gérer les changements dans le formulaire de modification d'utilisateur
  const handleEditUserChange = (e) => {
    const { name, value } = e.target;
    setEditUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gérer la sélection des sports pour un nouvel utilisateur
  const handleSportChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setNewUser(prev => ({
      ...prev,
      sports: selectedOptions
    }));
  };

  // Gérer la sélection des sports pour la modification d'un utilisateur
  const handleEditSportChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setEditUser(prev => ({
      ...prev,
      sports: selectedOptions
    }));
  };

  // Créer un nouvel utilisateur
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!newUser.email || !newUser.password || !newUser.displayName) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Créer l'utilisateur dans Firebase Auth avec l'instance secondaire
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth, 
        newUser.email, 
        newUser.password
      );
      
      // Créer le document utilisateur dans Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        displayName: newUser.displayName,
        email: newUser.email,
        role: newUser.role,
        sports: newUser.sports,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Déconnecter l'utilisateur de l'instance secondaire
      await secondaryAuth.signOut();
      
      // Réinitialiser le formulaire et fermer la modal
      setNewUser({
        email: '',
        password: '',
        displayName: '',
        role: 'member',
        sports: []
      });
      setShowAddUserModal(false);
      
      // Rafraîchir la liste des utilisateurs
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      if (error.code === 'auth/email-already-in-use') {
        setError("Cet email est déjà utilisé par un autre compte.");
      } else {
        setError("Une erreur est survenue lors de la création de l'utilisateur.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir la modal de suppression d'utilisateur
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setDeletePassword('');
    setDeleteError('');
    setShowDeleteModal(true);
  };

  // Fermer la modal de suppression d'utilisateur
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setDeletePassword('');
    setDeleteError('');
  };

  // Ouvrir la modal de modification d'utilisateur
  const openEditModal = (user) => {
    setUserToEdit(user);
    setEditUser({
      displayName: user.displayName || '',
      role: user.role || 'member',
      sports: user.sports || []
    });
    setEditError('');
    setShowEditModal(true);
  };

  // Fermer la modal de modification d'utilisateur
  const closeEditModal = () => {
    setShowEditModal(false);
    setUserToEdit(null);
    setEditUser({
      displayName: '',
      role: 'member',
      sports: []
    });
    setEditError('');
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setDeleteLoading(true);
      setDeleteError('');
      
      // Se connecter en tant que l'utilisateur à supprimer
      try {
        const userCredential = await signInWithEmailAndPassword(
          secondaryAuth,
          userToDelete.email,
          deletePassword
        );
        
        // Supprimer l'utilisateur de Firebase Auth
        await deleteUser(userCredential.user);
      } catch (authError) {
        console.error("Erreur lors de la suppression de l'authentification:", authError);
        setDeleteError("Mot de passe incorrect ou problème d'authentification.");
        setDeleteLoading(false);
        return;
      }
      
      // Supprimer le document utilisateur de Firestore
      await deleteDoc(doc(db, "users", userToDelete.id));
      
      // Fermer la modal et rafraîchir la liste
      closeDeleteModal();
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      setDeleteError("Une erreur est survenue lors de la suppression de l'utilisateur.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Modifier un utilisateur
  const handleEditUser = async (e) => {
    e.preventDefault();
    
    if (!userToEdit) return;
    
    try {
      setEditLoading(true);
      setEditError('');
      
      // Mettre à jour le document utilisateur dans Firestore
      await updateDoc(doc(db, "users", userToEdit.id), {
        displayName: editUser.displayName,
        role: editUser.role,
        sports: editUser.sports,
        updatedAt: serverTimestamp()
      });
      
      // Fermer la modal et rafraîchir la liste
      closeEditModal();
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la modification de l'utilisateur:", error);
      setEditError("Une erreur est survenue lors de la modification de l'utilisateur.");
    } finally {
      setEditLoading(false);
    }
  };

  // Ouvrir la modal d'ajout d'utilisateur
  const openAddUserModal = () => {
    setNewUser({
      email: '',
      password: '',
      displayName: '',
      role: 'member',
      sports: []
    });
    setError('');
    setShowAddUserModal(true);
  };

  // Fermer la modal d'ajout d'utilisateur
  const closeAddUserModal = () => {
    setShowAddUserModal(false);
    setNewUser({
      email: '',
      password: '',
      displayName: '',
      role: 'member',
      sports: []
    });
    setError('');
  };

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="admin-page">
        <PageTitle title="Administration" />
        <div className="admin-container">
          <div className="loading-admin">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <PageTitle title="Administration" />
        <div className="admin-container">
          <div className="admin-error-message">{error || "Vous n'avez pas les droits d'administration nécessaires."}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <PageTitle title="Administration" />
      <div className="admin-container">
        {error && <div className="admin-error-message">{error}</div>}
        
        {isAdmin && (
          <>
            <div className="admin-header">
              <h2>Gestion des utilisateurs</h2>
              <button className="add-user-button" onClick={openAddUserModal}>
                Ajouter un utilisateur
              </button>
            </div>
            
            <div className="users-list">
              {users.length > 0 ? (
                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Sports</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.displayName}</td>
                          <td>{user.email}</td>
                          <td>{user.role === 'admin' ? 'Admin' : 'Membre'}</td>
                          <td>
                            {user.sports && user.sports.length > 0 ? (
                              <div className="sport-bubble-container">
                                {user.sports.map(sport => (
                                  <span 
                                    key={sport} 
                                    className="sport-bubble"
                                    data-sport={sport.toLowerCase()}
                                  >
                                    {sport}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="no-sports">Aucun sport</span>
                            )}
                          </td>
                          <td className="actions-cell">
                            <button
                              className="edit-user"
                              onClick={() => openEditModal(user)}
                              title="Modifier l'utilisateur"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="delete-user"
                              onClick={() => openDeleteModal(user)}
                              disabled={user.id === currentUser.uid}
                              title={user.id === currentUser.uid ? "Vous ne pouvez pas supprimer votre propre compte" : "Supprimer l'utilisateur"}
                            >
                              <FaTimes />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-users">
                  Aucun utilisateur trouvé.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal d'ajout d'utilisateur */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Ajouter un nouvel utilisateur</h3>
              <button className="close-modal" onClick={closeAddUserModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-content">
              {error && <div className="modal-error">{error}</div>}
              
              <form onSubmit={handleCreateUser} className="add-user-form">
                <div className="form-group">
                  <label htmlFor="displayName">Nom complet*</label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={newUser.displayName}
                    onChange={handleNewUserChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email*</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleNewUserChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Mot de passe*</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleNewUserChange}
                    required
                    minLength="6"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="role">Rôle</label>
                  <select
                    id="role"
                    name="role"
                    value={newUser.role}
                    onChange={handleNewUserChange}
                  >
                    <option value="member">Membre</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="sports">Sports (maintenir Ctrl/Cmd pour sélectionner plusieurs)</label>
                  <select
                    id="sports"
                    name="sports"
                    multiple
                    value={newUser.sports}
                    onChange={handleSportChange}
                    className="multi-select"
                    size={Math.min(5, availableSports.length)}
                  >
                    {availableSports.map(sport => (
                      <option key={sport.id} value={sport.id}>
                        {sport.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={closeAddUserModal}
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="create-user-button"
                    disabled={loading}
                  >
                    {loading ? 'Création...' : 'Créer l\'utilisateur'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression d'utilisateur */}
      {showDeleteModal && userToDelete && (
        <div className="modal-overlay">
          <div className="modal-container delete-modal">
            <div className="modal-header">
              <h3>Supprimer l'utilisateur</h3>
              <button className="close-modal" onClick={closeDeleteModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-content">
              <p className="delete-warning">
                Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete.displayName}</strong> ?
                Cette action est irréversible.
              </p>
              
              <div className="form-group">
                <label htmlFor="deletePassword">Mot de passe de l'utilisateur*</label>
                <input
                  type="password"
                  id="deletePassword"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                />
                {deleteError && <div className="input-error">{deleteError}</div>}
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={closeDeleteModal}
                  disabled={deleteLoading}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="delete-button"
                  onClick={handleDeleteUser}
                  disabled={deleteLoading || !deletePassword}
                >
                  {deleteLoading ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification d'utilisateur */}
      {showEditModal && userToEdit && (
        <div className="modal-overlay">
          <div className="modal-container edit-modal">
            <div className="modal-header">
              <h3>Modifier l'utilisateur</h3>
              <button className="close-modal" onClick={closeEditModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-content">
              {editError && <div className="modal-error">{editError}</div>}
              
              <form onSubmit={handleEditUser} className="edit-user-form">
                <div className="form-group">
                  <label htmlFor="editEmail">Email</label>
                  <input
                    type="email"
                    id="editEmail"
                    value={userToEdit.email}
                    disabled
                    className="disabled-input"
                  />
                  <p className="input-help">L'email ne peut pas être modifié.</p>
                </div>
                
                <div className="form-group">
                  <label htmlFor="editDisplayName">Nom complet*</label>
                  <input
                    type="text"
                    id="editDisplayName"
                    name="displayName"
                    value={editUser.displayName}
                    onChange={handleEditUserChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="editRole">Rôle</label>
                  <select
                    id="editRole"
                    name="role"
                    value={editUser.role}
                    onChange={handleEditUserChange}
                    disabled={userToEdit.id === currentUser.uid}
                  >
                    <option value="member">Membre</option>
                    <option value="admin">Administrateur</option>
                  </select>
                  {userToEdit.id === currentUser.uid && (
                    <p className="input-help">Vous ne pouvez pas modifier votre propre rôle.</p>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="editSports">Sports (maintenir Ctrl/Cmd pour sélectionner plusieurs)</label>
                  <select
                    id="editSports"
                    name="sports"
                    multiple
                    value={editUser.sports}
                    onChange={handleEditSportChange}
                    className="multi-select"
                    size={Math.min(5, availableSports.length)}
                  >
                    {availableSports.map(sport => (
                      <option key={sport.id} value={sport.id}>
                        {sport.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={closeEditModal}
                    disabled={editLoading}
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="edit-user-button"
                    disabled={editLoading}
                  >
                    {editLoading ? 'Modification...' : 'Modifier'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;