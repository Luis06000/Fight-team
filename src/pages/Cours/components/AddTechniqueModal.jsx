import React from 'react';
import { FaTimes } from 'react-icons/fa';

const AddTechniqueModal = ({
  newTechnique,
  setNewTechnique,
  handleAddTechnique,
  closeModal,
  levels,
  isEditing = false
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{isEditing ? 'Modifier la technique' : 'Ajouter une technique'}</h3>
          <button className="close-modal" onClick={closeModal}>
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleAddTechnique} className="modal-form">
          <div className="form-group">
            <label htmlFor="techniqueTitle">Titre*</label>
            <input
              type="text"
              id="techniqueTitle"
              value={newTechnique.titre}
              onChange={(e) => setNewTechnique({...newTechnique, titre: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="techniqueLevel">Niveau*</label>
            <select
              id="techniqueLevel"
              value={newTechnique.level}
              onChange={(e) => setNewTechnique({...newTechnique, level: e.target.value})}
              required
            >
              <option value="">Sélectionner un niveau</option>
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="techniqueVideo">URL de la vidéo (YouTube)</label>
            <input
              type="text"
              id="techniqueVideo"
              value={newTechnique.video}
              onChange={(e) => setNewTechnique({...newTechnique, video: e.target.value})}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="techniqueDescription">Description</label>
            <textarea
              id="techniqueDescription"
              value={newTechnique.description}
              onChange={(e) => setNewTechnique({...newTechnique, description: e.target.value})}
              rows="4"
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={closeModal}>
              Annuler
            </button>
            <button type="submit" className="submit-button">
              {isEditing ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTechniqueModal; 