import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import AppHeader from './Header/App-header.js';
import AppFooter from './Footer/App-footer.js';
import Home from '../Home/Home.js';
import Projects from '../Projects/Projects.js';
import About from '../About/About.js';
import Background from '../../Background/Background.js';
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
    <Router basename="/My-portfolio">
      <Preloader load={load} />
      <div className="App" id={load ? "no-scroll" : "scroll"}>
        <Background />
        <AppHeader />
        <ScrollToTop />
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Home />} />
        </Routes>
        <AppFooter />
      </div>
    </Router>
  );
}

export default App;
