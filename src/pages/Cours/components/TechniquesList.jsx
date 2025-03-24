import React from 'react';
import { FaPlus } from 'react-icons/fa';
import TechniqueCard from './TechniqueCard';

const TechniquesList = ({
  selectedSport,
  selectedLevel,
  levels,
  handleLevelSelect,
  filteredTechniques,
  loading,
  isTeacher,
  openAddLevelModal,
  openAddTechniqueModal,
  openEditTechniqueModal,
  handleDeleteTechnique,
  formatVideoUrl
}) => {
  return (
    <div className="techniques-section">
      <div className="techniques-header">
        <h2>
          {selectedLevel === 'all' 
            ? `Toutes les techniques de ${selectedSport.name}` 
            : `Techniques de niveau ${selectedLevel}`}
        </h2>
        
        <div className="levels-filter-container">
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
          
          {isTeacher && (
            <div className="teacher-actions">
              <button className="add-level-button" onClick={openAddLevelModal}>
                <FaPlus /> Niveau
              </button>
              <button className="add-technique-button" onClick={openAddTechniqueModal}>
                <FaPlus /> Technique
              </button>
            </div>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="loading-techniques">Chargement des techniques...</div>
      ) : filteredTechniques.length > 0 ? (
        <div className="techniques-grid">
          {filteredTechniques.map(technique => (
            <TechniqueCard
              key={technique.id}
              technique={technique}
              selectedLevel={selectedLevel}
              isTeacher={isTeacher}
              openEditTechniqueModal={openEditTechniqueModal}
              handleDeleteTechnique={handleDeleteTechnique}
              formatVideoUrl={formatVideoUrl}
            />
          ))}
        </div>
      ) : (
        <div className="no-techniques">
          <p>Aucune technique disponible pour ce niveau.</p>
          {isTeacher && (
            <p>Cliquez sur "Ajouter une technique" pour commencer.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TechniquesList;