import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import ImageConverter from './components/SIC/App';
import TodoList from './components/2Do/App';
import EraTycoon from './components/EraTycoon/App';
import Navigation from './components/Navigation';

const App: React.FC = () => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col transition-colors duration-500 overflow-hidden relative">
        {/* Animated Background Blobs */}
        <div className="bg-blob blob-1"></div>
        <div className="bg-blob blob-2"></div>
        <div className="bg-blob blob-3"></div>

        <Navigation theme={theme} toggleTheme={toggleTheme} />
        
        <main className="flex-1 flex flex-col w-full mx-auto relative">
          <Routes>
            {/* Default Route: Home */}
            <Route path="/" element={
              <div className="pt-24 min-h-screen flex flex-col items-center justify-center home-gradient">
                <Home />
              </div>
            } />
            
            <Route path="/converter" element={
              <div className="pt-24 min-h-screen flex flex-col items-center justify-center">
                <ImageConverter />
              </div>
            } />
            
            <Route path="/todo" element={
              <div className="pt-24 min-h-screen flex flex-col items-center justify-center">
                <TodoList />
              </div>
            } />
            
            <Route path="/tycoon" element={<EraTycoon />} />

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;