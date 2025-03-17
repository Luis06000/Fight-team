import React from 'react';
import './PageTitle.css';

const PageTitle = ({ title, emoji }) => {
  return (
    <div className="title-container">
      <div className="title">
        <h1>{title}</h1>
        <span className="emoji">{emoji}</span>
      </div>
    </div>
  );
};

export default PageTitle;
