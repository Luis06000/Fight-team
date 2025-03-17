import React from 'react';
import Header from '../../common/Header/Header';
import Footer from '../../common/Footer/Footer';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
