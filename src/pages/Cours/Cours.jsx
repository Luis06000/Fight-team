import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import PageTitle from '../../components/common/PageTitle/PageTitle';
import SportsList from './components/SportsList';
import TechniquesList from './components/TechniquesList';
import AddLevelModal from './components/AddLevelModal';
import AddTechniqueModal from './components/AddTechniqueModal';
import './Cours.css';

const Cours = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupérer les paramètres d'URL
  const queryParams = new URLSearchParams(location.search);
  const sportParam = queryParams.get('sport');
  const levelParam = queryParams.get('niveau') || 'all';
  
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(levelParam);
  const [levels, setLevels] = useState([]);
  const [allTechniques, setAllTechniques] = useState([]);
  const [filteredTechniques, setFilteredTechniques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  
  // États pour les modales
  const [showAddLevelModal, setShowAddLevelModal] = useState(false);
  const [showAddTechniqueModal, setShowAddTechniqueModal] = useState(false);
  const [techniqueToEdit, setTechniqueToEdit] = useState(null);
  
  // États pour les formulaires
  const [newLevel, setNewLevel] = useState('');
  const [newTechnique, setNewTechnique] = useState({
    titre: '',
    description: '',
    video: '',
    level: ''
  });
  
  // Vérifier si l'utilisateur est un enseignant ou un administrateur
  useEffect(() => {
    async function checkTeacherStatus() {
      if (!currentUser) {
        setIsTeacher(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsTeacher(userData.role === 'teacher' || userData.role === 'admin');
        } else {
          setIsTeacher(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des droits d'enseignant:", error);
        setIsTeacher(false);
      }
    }

    checkTeacherStatus();
  }, [currentUser]);

  // Utiliser useCallback pour la fonction updateUrlParams
  const updateUrlParams = useCallback((sportId, level) => {
    const params = new URLSearchParams();
    if (sportId) params.set('sport', sportId);
    if (level) params.set('niveau', level);
    navigate(`/cours?${params.toString()}`, { replace: true });
  }, [navigate]);

  // Récupérer la liste des sports et initialiser le sport sélectionné depuis l'URL
  useEffect(() => {
    async function fetchSports() {
      try {
        const sportsCollection = collection(db, 'cours');
        const sportsSnapshot = await getDocs(sportsCollection);
        const sportsList = sportsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.id.charAt(0).toUpperCase() + doc.id.slice(1),
          ...doc.data()
        }));
        setSports(sportsList);
        
        // Si un sport est spécifié dans l'URL, le sélectionner
        if (sportParam) {
          const sportFromUrl = sportsList.find(sport => sport.id === sportParam);
          if (sportFromUrl) {
            setSelectedSport(sportFromUrl);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des sports:", error);
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      fetchSports();
    }
  }, [currentUser, sportParam]);

  // Récupérer les niveaux et toutes les techniques lorsqu'un sport est sélectionné
  useEffect(() => {
    async function fetchLevelsAndAllTechniques() {
      if (!selectedSport) return;
      
      try {
        setLoading(true);
        
        // Récupérer les sous-collections manuellement
        const sportRef = doc(db, 'cours', selectedSport.id);
        const sportDoc = await getDoc(sportRef);
        
        let foundLevels = [];
        
        if (sportDoc.exists() && sportDoc.data().niveaux) {
          foundLevels = sportDoc.data().niveaux;
        } else {
          // Liste des niveaux possibles
          const possibleLevels = [
            'blanc', 'jaune', 'orange', 'vert', 'bleu', 'marron', 'noir',
            'débutant', 'intermédiaire', 'avancé', 'expert'
          ];
          
          // Vérifier chaque niveau possible
          for (const level of possibleLevels) {
            try {
              const levelCollection = collection(db, `cours/${selectedSport.id}/${level}`);
              const levelDocs = await getDocs(levelCollection);
              
              if (!levelDocs.empty) {
                foundLevels.push(level);
              }
            } catch (e) {
              // Ignorer les erreurs
            }
          }
        }
        
        setLevels(foundLevels);
        
        // Récupérer toutes les techniques pour tous les niveaux
        const allTechniquesArray = [];
        
        for (const level of foundLevels) {
          try {
            const techniquesCollection = collection(db, `cours/${selectedSport.id}/${level}`);
            const techniquesSnapshot = await getDocs(techniquesCollection);
            
            if (!techniquesSnapshot.empty) {
              const techniquesList = techniquesSnapshot.docs.map(doc => ({
                id: doc.id,
                level: level,
                ...doc.data()
              }));
              allTechniquesArray.push(...techniquesList);
            }
          } catch (error) {
            console.error(`Erreur lors du chargement des techniques pour ${level}:`, error);
          }
        }
        
        // Trier les techniques par niveau
        allTechniquesArray.sort((a, b) => {
          const levelOrder = {
            'blanc': 1, 'jaune': 2, 'orange': 3, 'vert': 4, 'bleu': 5, 'marron': 6, 'noir': 7,
            'débutant': 1, 'intermédiaire': 2, 'avancé': 3, 'expert': 4
          };
          
          const levelA = levelOrder[a.level] || 999;
          const levelB = levelOrder[b.level] || 999;
          
          return levelA - levelB;
        });
        
        setAllTechniques(allTechniquesArray);
        
        // Vérifier si le niveau dans l'URL existe pour ce sport
        if (levelParam !== 'all' && !foundLevels.includes(levelParam)) {
          // Si le niveau n'existe pas, réinitialiser à 'all'
          setSelectedLevel('all');
          updateUrlParams(selectedSport.id, 'all');
        } else {
          setSelectedLevel(levelParam);
        }
        
      } catch (error) {
        console.error("Erreur lors du chargement des niveaux et techniques:", error);
        setLevels([]);
        setAllTechniques([]);
        setFilteredTechniques([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLevelsAndAllTechniques();
  }, [selectedSport, levelParam, updateUrlParams]);

  // Filtrer les techniques lorsque le niveau sélectionné change
  useEffect(() => {
    if (!allTechniques.length) {
      setFilteredTechniques([]);
      return;
    }
    
    if (selectedLevel === 'all') {
      setFilteredTechniques(allTechniques);
    } else {
      const filtered = allTechniques.filter(technique => technique.level === selectedLevel);
      setFilteredTechniques(filtered);
    }
  }, [selectedLevel, allTechniques]);

  // Fonctions pour gérer la navigation
  const handleSportSelect = (sport) => {
    setSelectedSport(sport);
    setSelectedLevel('all');
    updateUrlParams(sport.id, 'all');
  };

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    updateUrlParams(selectedSport.id, level);
    
    if (level === 'all') {
      setFilteredTechniques(allTechniques);
    } else {
      setFilteredTechniques(allTechniques.filter(t => t.level === level));
    }
  };

  // Fonction pour formater les URL YouTube
  const formatVideoUrl = (url) => {
    if (!url) return '';
    
    // Convertir les URLs YouTube standards en URLs d'intégration
    if (url.includes('youtube.com/watch')) {
      // Extraire l'ID de la vidéo YouTube
      const videoId = url.split('v=')[1]?.split('&')[0];
      if (videoId) {
        // Retourner l'URL d'intégration avec des paramètres pour un affichage propre
        return `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0`;
      }
    }
    
    // Convertir les URLs YouTube courts (youtu.be)
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0`;
      }
    }
    
    // Si c'est déjà une URL d'intégration, la retourner telle quelle
    if (url.includes('youtube.com/embed')) {
      // Ajouter des paramètres pour un affichage propre si nécessaire
      if (!url.includes('?')) {
        return `${url}?rel=0&showinfo=0`;
      }
      return url;
    }
    
    // Pour les autres types d'URLs, retourner telle quelle
    return url;
  };

  // Fonctions pour gérer les modales
  const openAddLevelModal = () => {
    setNewLevel('');
    setShowAddLevelModal(true);
  };

  const closeAddLevelModal = () => {
    setShowAddLevelModal(false);
  };

  const openAddTechniqueModal = () => {
    setTechniqueToEdit(null);
    setNewTechnique({
      titre: '',
      description: '',
      video: '',
      level: selectedLevel !== 'all' ? selectedLevel : ''
    });
    setShowAddTechniqueModal(true);
  };

  const closeAddTechniqueModal = () => {
    setShowAddTechniqueModal(false);
  };

  const openEditTechniqueModal = (technique) => {
    setTechniqueToEdit(technique);
    setNewTechnique({
      titre: technique.titre || technique.title || '',
      description: technique.description || '',
      video: technique.video || '',
      level: technique.level || ''
    });
    setShowAddTechniqueModal(true);
  };

  // Fonctions pour gérer les ajouts/modifications
  const handleAddLevel = async (e) => {
    e.preventDefault();
    
    if (!selectedSport || !newLevel.trim()) return;
    
    try {
      setLoading(true);
      
      // Créer une nouvelle collection pour le niveau
      const levelRef = collection(db, `cours/${selectedSport.id}/${newLevel.trim()}`);
      
      // Ajouter un document vide pour s'assurer que la collection existe
      await addDoc(levelRef, {
        createdAt: new Date(),
        description: `Niveau ${newLevel.trim()} pour ${selectedSport.name}`
      });
      
      // Mettre à jour le document du sport pour inclure le nouveau niveau
      const sportRef = doc(db, 'cours', selectedSport.id);
      const sportDoc = await getDoc(sportRef);
      
      if (sportDoc.exists()) {
        const sportData = sportDoc.data();
        const existingLevels = sportData.niveaux || [];
        
        if (!existingLevels.includes(newLevel.trim())) {
          await updateDoc(sportRef, {
            niveaux: [...existingLevels, newLevel.trim()]
          });
        }
      }
      
      // Rafraîchir les niveaux
      const updatedLevels = [...levels, newLevel.trim()];
      setLevels(updatedLevels);
      
      // Fermer la modale
      closeAddLevelModal();
      
      // Sélectionner le nouveau niveau
      handleLevelSelect(newLevel.trim());
      
    } catch (error) {
      console.error("Erreur lors de l'ajout du niveau:", error);
      alert("Une erreur est survenue lors de l'ajout du niveau.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTechnique = async (e) => {
    e.preventDefault();
    
    if (!selectedSport || !newTechnique.titre || !newTechnique.level) return;
    
    try {
      setLoading(true);
      
      const techniqueData = {
        titre: newTechnique.titre,
        description: newTechnique.description || '',
        video: newTechnique.video || '',
        createdAt: new Date()
      };
      
      if (techniqueToEdit) {
        // Mise à jour d'une technique existante
        const techniqueRef = doc(db, `cours/${selectedSport.id}/${techniqueToEdit.level}`, techniqueToEdit.id);
        
        if (techniqueToEdit.level === newTechnique.level) {
          // Même niveau, simple mise à jour
          await updateDoc(techniqueRef, techniqueData);
        } else {
          // Changement de niveau, supprimer l'ancienne et créer une nouvelle
          await deleteDoc(techniqueRef);
          const newLevelCollection = collection(db, `cours/${selectedSport.id}/${newTechnique.level}`);
          await addDoc(newLevelCollection, techniqueData);
        }
      } else {
        // Ajout d'une nouvelle technique
        const levelCollection = collection(db, `cours/${selectedSport.id}/${newTechnique.level}`);
        await addDoc(levelCollection, techniqueData);
      }
      
      // Rafraîchir les techniques
      const updatedTechniques = [...allTechniques];
      
      if (techniqueToEdit) {
        // Mettre à jour la technique existante dans le tableau
        const index = updatedTechniques.findIndex(t => t.id === techniqueToEdit.id && t.level === techniqueToEdit.level);
        
        if (index !== -1) {
          if (techniqueToEdit.level === newTechnique.level) {
            updatedTechniques[index] = {
              ...updatedTechniques[index],
              ...techniqueData,
              level: newTechnique.level
            };
          } else {
            // Supprimer l'ancienne technique
            updatedTechniques.splice(index, 1);
            
            // Ajouter la nouvelle technique
            updatedTechniques.push({
              id: `temp-${Date.now()}`, // ID temporaire qui sera remplacé lors du prochain chargement
              ...techniqueData,
              level: newTechnique.level
            });
          }
        }
      } else {
        // Ajouter la nouvelle technique au tableau
        updatedTechniques.push({
          id: `temp-${Date.now()}`, // ID temporaire qui sera remplacé lors du prochain chargement
          ...techniqueData,
          level: newTechnique.level
        });
      }
      
      setAllTechniques(updatedTechniques);
      
      // Fermer la modale
      closeAddTechniqueModal();
      
      // Si on a changé de niveau, mettre à jour le niveau sélectionné
      if (techniqueToEdit && techniqueToEdit.level !== newTechnique.level) {
        handleLevelSelect(newTechnique.level);
      }
      
    } catch (error) {
      console.error("Erreur lors de l'ajout/modification de la technique:", error);
      alert("Une erreur est survenue lors de l'ajout/modification de la technique.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTechnique = async (technique) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la technique "${technique.titre || technique.title || 'Sans titre'}" ?`)) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Supprimer la technique de la base de données
      const techniqueRef = doc(db, `cours/${selectedSport.id}/${technique.level}`, technique.id);
      await deleteDoc(techniqueRef);
      
      // Mettre à jour la liste des techniques
      const updatedTechniques = allTechniques.filter(t => !(t.id === technique.id && t.level === technique.level));
      setAllTechniques(updatedTechniques);
      
    } catch (error) {
      console.error("Erreur lors de la suppression de la technique:", error);
      alert("Une erreur est survenue lors de la suppression de la technique.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="courses-page">
      <PageTitle title="Nos Cours" emoji="🥋" />
      
      <div className="courses-container">
        {loading && !selectedSport ? (
          <div className="loading-courses">Chargement des cours...</div>
        ) : (
          <div className="courses-content">
            <SportsList 
              sports={sports}
              selectedSport={selectedSport}
              handleSportSelect={handleSportSelect}
              isTeacher={isTeacher}
            />

            {selectedSport && (
              <TechniquesList
                selectedSport={selectedSport}
                selectedLevel={selectedLevel}
                levels={levels}
                handleLevelSelect={handleLevelSelect}
                filteredTechniques={filteredTechniques}
                loading={loading}
                isTeacher={isTeacher}
                openAddLevelModal={openAddLevelModal}
                openAddTechniqueModal={openAddTechniqueModal}
                openEditTechniqueModal={openEditTechniqueModal}
                handleDeleteTechnique={handleDeleteTechnique}
                formatVideoUrl={formatVideoUrl}
              />
            )}
          </div>
        )}
      </div>
      
      {showAddLevelModal && (
        <AddLevelModal
          selectedSport={selectedSport}
          newLevel={newLevel}
          setNewLevel={setNewLevel}
          handleAddLevel={handleAddLevel}
          closeModal={closeAddLevelModal}
        />
      )}
      
      {showAddTechniqueModal && (
        <AddTechniqueModal
          newTechnique={newTechnique}
          setNewTechnique={setNewTechnique}
          handleAddTechnique={handleAddTechnique}
          closeModal={closeAddTechniqueModal}
          levels={levels}
          isEditing={!!techniqueToEdit}
        />
      )}
    </div>
  );
};

export default Cours; 