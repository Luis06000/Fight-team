import React from 'react';
import { FaTimes } from 'react-icons/fa';

const AddLevelModal = ({ 
  selectedSport, 
  newLevel, 
  setNewLevel, 
  handleAddLevel, 
  closeModal 
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Ajouter un niveau pour {selectedSport?.name}</h3>
          <button className="close-modal" onClick={closeModal}>
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleAddLevel} className="modal-form">
          <div className="form-group">
            <label htmlFor="levelName">Nom du niveau*</label>
            <input
              type="text"
              id="levelName"
              value={newLevel}
              onChange={(e) => setNewLevel(e.target.value)}
              required
              placeholder="ex: débutant, blanc, jaune..."
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={closeModal}>
              Annuler
            </button>
            <button type="submit" className="submit-button">
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLevelModal; 