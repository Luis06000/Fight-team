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
  
  // Ajouter un nouvel état pour le cache
  const [sportsCache, setSportsCache] = useState({});
  
  // Vérifier les droits d'accès et d'édition
  useEffect(() => {
    async function checkAccess() {
      if (!currentUser || !selectedSport) {
        setIsTeacher(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Admin peut tout faire
          if (userData.role === 'admin') {
            setIsTeacher(true);
            return;
          }
          
          // Coach peut éditer uniquement son sport
          if (userData.role === 'coach') {
            setIsTeacher(userData.coachDomain === selectedSport.id);
            return;
          }

          // Membre ne peut rien éditer
          setIsTeacher(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des droits:", error);
        setIsTeacher(false);
      }
    }

    checkAccess();
  }, [currentUser, selectedSport]);

  // Utiliser useCallback pour la fonction updateUrlParams
  const updateUrlParams = useCallback((sportId, level) => {
    const params = new URLSearchParams();
    if (sportId) params.set('sport', sportId);
    if (level) params.set('niveau', level);
    navigate(`/cours?${params.toString()}`, { replace: true });
  }, [navigate]);

  // Ajouter un useCallback pour la fonction de mise en cache
  const updateCache = useCallback((sportId, levels, techniques) => {
    setSportsCache(prev => ({
      ...prev,
      [sportId]: {
        levels,
        techniques
      }
    }));
  }, []);

  // Effet pour charger les sports accessibles
  useEffect(() => {
    async function loadSports() {
      if (!currentUser) return;

      try {
        setLoading(true);
        
        // Charger les données de l'utilisateur
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        // Charger tous les sports depuis Firestore
        const sportsCollection = collection(db, 'cours');
        const sportsSnapshot = await getDocs(sportsCollection);
        const allSports = sportsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.id.charAt(0).toUpperCase() + doc.id.slice(1),
          ...doc.data()
        }));

        // Filtrer les sports selon le rôle
        let accessibleSports;
        if (userData.role === 'admin' || userData.role === 'coach') {
          // Admin et coach voient tous les sports
          accessibleSports = allSports;
        } else {
          // Membre ne voit que ses sports inscrits
          const userSports = userData.sports || [];
          accessibleSports = allSports.filter(sport => userSports.includes(sport.id));
        }

        setSports(accessibleSports);

        // Gérer la sélection initiale du sport
        if (sportParam) {
          const sportFromUrl = accessibleSports.find(sport => sport.id === sportParam);
          if (sportFromUrl) {
            setSelectedSport(sportFromUrl);
          } else if (accessibleSports.length > 0) {
            setSelectedSport(accessibleSports[0]);
            updateUrlParams(accessibleSports[0].id, levelParam);
          }
        } else if (accessibleSports.length > 0 && !selectedSport) {
          setSelectedSport(accessibleSports[0]);
          updateUrlParams(accessibleSports[0].id, levelParam);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des sports:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, sportParam]);

  // Modifier l'effet de chargement des niveaux et techniques
  useEffect(() => {
    async function fetchLevelsAndAllTechniques() {
      if (!selectedSport) return;
      
      // Vérifier si les données sont déjà en cache
      if (sportsCache[selectedSport.id]) {
        setLevels(sportsCache[selectedSport.id].levels);
        setAllTechniques(sportsCache[selectedSport.id].techniques);
        return;
      }
      
      try {
        setLoading(true);
        setAllTechniques([]); // Réinitialiser avant le chargement
        setFilteredTechniques([]);
        setLevels([]);
        
        const possibleLevels = [
          'blanc', 'jaune', 'orange', 'vert', 'bleu', 'marron', 'noir',
          'débutant', 'intermédiaire', 'avancé', 'expert'
        ];
        
        const foundLevels = [];
        const allTechniquesArray = [];
        
        // Charger les niveaux d'abord
        for (const level of possibleLevels) {
          try {
            const levelCollection = collection(db, `cours/${selectedSport.id}/${level}`);
            const levelDocs = await getDocs(levelCollection);
            
            if (!levelDocs.empty) {
              foundLevels.push(level);
              
              // Charger les techniques de ce niveau
              levelDocs.forEach((doc) => {
                const technique = {
                  id: doc.id,
                  level: level,
                  ...doc.data()
                };
                allTechniquesArray.push(technique);
              });
            }
          } catch (e) {
            console.error(`Erreur lors du chargement du niveau ${level}:`, e);
          }
        }
        
        setLevels(foundLevels);
        setAllTechniques(allTechniquesArray);
        
        // Mettre à jour le cache
        updateCache(selectedSport.id, foundLevels, allTechniquesArray);
        
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
  }, [selectedSport, sportsCache, updateCache]);

  // Modifier l'effet de filtrage des techniques
  useEffect(() => {
    if (!allTechniques) return;
    
    if (selectedLevel === 'all') {
      setFilteredTechniques(allTechniques);
    } else {
      const filtered = allTechniques.filter(technique => technique.level === selectedLevel);
      setFilteredTechniques(filtered);
    }
  }, [selectedLevel, allTechniques]);

  // Modifier handleSportSelect pour inclure la vérification d'accès
  const handleSportSelect = (sport) => {
    if (sport.id === selectedSport?.id) return;
    
    setSelectedSport(sport);
    setSelectedLevel('all');
    updateUrlParams(sport.id, levelParam);
  };

  // Modifier handleLevelSelect
  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    updateUrlParams(selectedSport.id, level);
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
      
      let updatedTechnique;
      
      if (techniqueToEdit) {
        // Mise à jour d'une technique existante
        const techniqueRef = doc(db, `cours/${selectedSport.id}/${techniqueToEdit.level}`, techniqueToEdit.id);
        
        if (techniqueToEdit.level === newTechnique.level) {
          // Même niveau, simple mise à jour
          await updateDoc(techniqueRef, techniqueData);
          updatedTechnique = {
            ...techniqueData,
            level: newTechnique.level
          };
        } else {
          // Changement de niveau, supprimer l'ancienne et créer une nouvelle
          await deleteDoc(techniqueRef);
          const newLevelCollection = collection(db, `cours/${selectedSport.id}/${newTechnique.level}`);
          const docRef = await addDoc(newLevelCollection, techniqueData);
          updatedTechnique = {
            id: docRef.id,
            ...techniqueData,
            level: newTechnique.level
          };
        }
      } else {
        // Ajout d'une nouvelle technique
        const levelCollection = collection(db, `cours/${selectedSport.id}/${newTechnique.level}`);
        const docRef = await addDoc(levelCollection, techniqueData);
        updatedTechnique = {
          id: docRef.id,
          ...techniqueData,
          level: newTechnique.level
        };
      }
      
      // Mettre à jour le cache
      setSportsCache(prev => ({
        ...prev,
        [selectedSport.id]: {
          ...prev[selectedSport.id],
          techniques: techniqueToEdit 
            ? prev[selectedSport.id].techniques.map(t => 
                t.id === techniqueToEdit.id ? updatedTechnique : t
              )
            : [...prev[selectedSport.id].techniques, updatedTechnique]
        }
      }));
      
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
      
      await deleteDoc(doc(db, `cours/${selectedSport.id}/${technique.level}`, technique.id));
      
      // Mettre à jour le cache
      setSportsCache(prev => ({
        ...prev,
        [selectedSport.id]: {
          ...prev[selectedSport.id],
          techniques: prev[selectedSport.id].techniques.filter(
            t => !(t.id === technique.id && t.level === technique.level)
          )
        }
      }));
      
      setAllTechniques(prev => 
        prev.filter(t => !(t.id === technique.id && t.level === technique.level))
      );
      
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue lors de la suppression.");
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