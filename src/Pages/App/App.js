import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import AppHeader from './Header/App-header.js';
import AppFooter from './Footer/App-footer.js';
import Accueil from '../Accueil/Accueil.js';
import Inscription from '../Inscription/Inscription.js';
import About from '../About/About.js';
import Preloader from '../Loader/Preloader.js';


function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [load, updateLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateLoad(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Preloader load={load} />
      <div className="App" id={load ? "no-scroll" : "scroll"}>
        <AppHeader />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/Accueil" element={<Accueil />} />
          <Route path="/Inscription" element={<Inscription />} />
          <Route path="/About" element={<About />} />
          <Route path="*" element={<Accueil />} />
        </Routes>
        <AppFooter />
      </div>
    </Router>
  );
}

export default App;
