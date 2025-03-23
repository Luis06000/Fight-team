import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import PageTitle from '../../components/common/PageTitle/PageTitle';
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

  const handleSportSelect = (sport) => {
    setSelectedSport(sport);
    updateUrlParams(sport.id, 'all');
  };

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    updateUrlParams(selectedSport?.id, level);
  };

  const formatVideoUrl = (url) => {
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
            <div className="sports-list">
              <h2>Sports</h2>
              <div className="sports-grid">
                {sports.length > 0 ? (
                  sports.map(sport => (
                    <div 
                      key={sport.id} 
                      className={`sport-card ${selectedSport?.id === sport.id ? 'selected' : ''}`}
                      onClick={() => handleSportSelect(sport)}
                    >
                      <h3>{sport.name}</h3>
                      {sport.description && <p>{sport.description}</p>}
                    </div>
                  ))
                ) : (
                  <div className="no-sports">
                    <p>Aucun sport disponible pour le moment.</p>
                  </div>
                )}
              </div>
            </div>

            {selectedSport && (
              <div className="techniques-section">
                <div className="techniques-header">
                  <h2>
                    {selectedLevel === 'all' 
                      ? `Toutes les techniques de ${selectedSport.name}` 
                      : `Techniques de niveau ${selectedLevel}`}
                  </h2>
                  
                  <div className="levels-filter">
                    <div 
                      className={`level-pill ${selectedLevel === 'all' ? 'selected' : ''}`}
                      onClick={() => handleLevelSelect('all')}
                    >
                      Tous les cours
                    </div>
                    {levels.map(level => (
                      <div 
                        key={level} 
                        className={`level-pill ${selectedLevel === level ? 'selected' : ''}`}
                        onClick={() => handleLevelSelect(level)}
                      >
                        {level}
                      </div>
                    ))}
                  </div>
                </div>
                
                {loading ? (
                  <div className="loading-techniques">Chargement des techniques...</div>
                ) : filteredTechniques.length > 0 ? (
                  <div className="techniques-grid">
                    {filteredTechniques.map(technique => (
                      <div key={technique.id} className="technique-card">
                        <h3>
                          {technique.titre || technique.title || "Sans titre"}
                          {selectedLevel === 'all' && (
                            <span className="technique-level">{technique.level}</span>
                          )}
                        </h3>
                        
                        {technique.video && (
                          <div className="video-container">
                            <iframe
                              src={formatVideoUrl(technique.video)}
                              title={technique.titre || technique.title || "Vidéo"}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        )}
                        
                        <p className="technique-description">{technique.description || "Aucune description disponible"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-techniques">
                    <p>Aucune technique disponible pour ce niveau.</p>
                    <p>Vérifiez la structure de votre base de données.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cours; 