import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const TechniqueCard = ({
  technique,
  selectedLevel,
  isTeacher,
  openEditTechniqueModal,
  handleDeleteTechnique,
  formatVideoUrl
}) => {
  return (
    <div className="technique-card">
      <div className="technique-header">
        <h3>
          {technique.titre || technique.title || "Sans titre"}
          {selectedLevel === 'all' && (
            <span className="technique-level">{technique.level}</span>
          )}
        </h3>
        
        {isTeacher && (
          <div className="technique-actions">
            <button 
              className="edit-technique-button" 
              onClick={(e) => {
                e.stopPropagation();
                openEditTechniqueModal(technique);
              }}
            >
              <FaEdit />
            </button>
            <button 
              className="delete-technique-button" 
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTechnique(technique);
              }}
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>
      
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
  );
};

export default TechniqueCard; 