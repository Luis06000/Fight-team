import React from 'react';

const SportsList = ({ 
  sports, 
  selectedSport, 
  handleSportSelect, 
  isTeacher
}) => {
  return (
    <div className="sports-list">
      <div className="sports-header">
        <h2>Sports</h2>
      </div>
      
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
  );
};

export default SportsList; 