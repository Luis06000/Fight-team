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
import Login from './pages/Login/Login';
import Cours from './pages/Cours/Cours';
import Profile from './pages/Profile/Profile';
import Admin from './pages/Admin/Admin';
import Preloader from './components/common/Preloader/Preloader';
import ScrollToTop from './utils/ScrollToTop';
import { AuthProvider } from './contexts/AuthContext';

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
    <AuthProvider>
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
            <Route path="/login" element={
              <MainLayout>
                <Login />
              </MainLayout>
            } />
            <Route path="/cours" element={
              <MainLayout>
                <Cours />
              </MainLayout>
            } />
            <Route path="/profil" element={
              <MainLayout>
                <Profile />
              </MainLayout>
            } />
            <Route path="/admin" element={
              <MainLayout>
                <Admin />
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
    </AuthProvider>
  );
};

export default App;
