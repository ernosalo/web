
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  theme: string;
  toggleTheme: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ theme, toggleTheme }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav 
      className={`fixed left-1/2 -translate-x-1/2 z-[1000] w-[95%] max-w-4xl transition-all duration-500 ease-in-out ${
        isMinimized ? 'top-[-44px]' : 'top-4'
      }`}
    >
      <div className="relative group/nav">
        <div className="glass shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 rounded-2xl px-4 md:px-8 h-14 flex items-center justify-between transition-all duration-300">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="p-2 rounded-xl hover:bg-white/10 transition-all group flex items-center justify-center" 
              aria-label="Home"
            >
              <svg className="w-5 h-5 text-black dark:text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-4">
            {[
              { path: '/converter', label: 'SIC' },
              { path: '/todo', label: '2Do' },
              { path: '/tycoon', label: 'Tycoon' },
              { path: '/smartspend', label: 'SmartSpend' }
            ].map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`px-3 md:px-5 py-1.5 rounded-xl text-[10px] font-bold tracking-[0.2em] transition-all duration-500 uppercase flex items-center justify-center ${
                  isActive(link.path) 
                  ? 'text-black dark:text-white bg-white/15 shadow-[0_0_20px_rgba(255,255,255,0.15)] ring-1 ring-white/20' 
                  : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-1">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" /></svg>
              ) : (
                <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              )}
            </button>

            {/* Minimize Toggle Button moved to the right of the theme button */}
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white"
              aria-label={isMinimized ? "Expand navigation" : "Collapse navigation"}
            >
              <svg 
                className={`w-4 h-4 transition-transform duration-500 ${isMinimized ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Small "handle" button visible when collapsed */}
        <button 
          onClick={() => setIsMinimized(false)}
          className={`absolute left-1/2 -translate-x-1/2 bottom-[-16px] glass px-4 py-1 rounded-b-xl border-x border-b border-white/10 transition-all duration-500 ${
            isMinimized ? 'opacity-100' : 'opacity-0 pointer-events-none'
          } hover:bg-white/5 group`}
        >
          <svg className="w-4 h-4 text-gray-500 group-hover:text-black dark:group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
