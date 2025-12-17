import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppData } from '../contexts/AppDataContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useAppData();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-colors ${
        theme === 'dark' 
          ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' 
          : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
      }`}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};