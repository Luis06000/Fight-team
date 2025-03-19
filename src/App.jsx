import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route
} from 'react-router-dom';
import MainLayout from './components/layout/MainLayout/MainLayout';
import Home from './pages/Home/Home';
import Registration from './pages/Registration/Registration';
import About from './pages/About/About';
import Preloader from './components/common/Preloader/Preloader';
import ScrollToTop from './utils/ScrollToTop';

// Configuration des drapeaux futurs
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  },
  basename: process.env.PUBLIC_URL
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router {...router}>
      <Preloader isLoading={isLoading} />
      <div className={`app ${isLoading ? 'no-scroll' : 'scroll'}`}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={
            <MainLayout>
              <Home />
            </MainLayout>
          } />
          <Route path="/inscription" element={
            <MainLayout>
              <Registration />
            </MainLayout>
          } />
          <Route path="/a-propos" element={
            <MainLayout>
              <About />
            </MainLayout>
          } />
          <Route path="*" element={
            <MainLayout>
              <Home />
            </MainLayout>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
