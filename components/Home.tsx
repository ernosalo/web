import React from 'react';
import { Link } from 'react-router-dom';

const ToolCard = ({ to, title, icon }: { to: string, title: string, icon: string }) => (
  <Link 
    to={to} 
    className="group relative p-8 glass rounded-[3rem] shadow-xl dark:shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/20 transition-all duration-500 flex flex-col items-center text-center h-80 w-full animate-fade-in-up"
  >
    {/* Icon Container - Fixed height to ensure icons line up */}
    <div className="h-32 flex items-center justify-center w-full mb-2">
      <div className="text-6xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 inline-block drop-shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
        {icon}
      </div>
    </div>
    
    {/* Title Container - Flex-1 to occupy remaining space and center text */}
    <div className="flex-1 flex flex-col items-center justify-center w-full">
      <h3 className="text-2xl font-bold tracking-tight leading-tight text-slate-800 dark:text-white/90 group-hover:text-black dark:group-hover:text-white transition-colors">
        {title}
      </h3>
    </div>
    
    {/* Footer Indicator */}
    <div className="mt-4 flex items-center justify-center text-[10px] font-black tracking-[0.3em] uppercase opacity-40 dark:opacity-30 group-hover:opacity-100 text-slate-500 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300">
      Open Tool
      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </div>

    {/* Subtle Inner Glow on Hover */}
    <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-black/5 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
  </Link>
);

const Home: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
        <ToolCard 
          to="/converter" 
          title="Simple Image Converter" 
          icon="🖼️"
        />
        <ToolCard 
          to="/todo" 
          title="2Do List" 
          icon="📝"
        />
        <ToolCard 
          to="/tycoon" 
          title="Era Tycoon" 
          icon="🛖"
        />
        <ToolCard 
          to="/smartspend" 
          title="Income/Expenses Tracker" 
          icon="📊"
        />
      </div>
      
      {/* Decorative center element */}
      <div className="mt-20 opacity-20 hover:opacity-50 transition-opacity">
        <div className="w-1 h-12 bg-gradient-to-b from-slate-900 dark:from-white to-transparent rounded-full mx-auto" />
      </div>
    </div>
  );
};

export default Home;