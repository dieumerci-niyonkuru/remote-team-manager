import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useStore } from '../../store';
import { Button } from '../common/Button';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useStore();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button 
      variant="icon" 
      onClick={toggleTheme} 
      className="relative overflow-hidden group"
      aria-label="Toggle Theme"
    >
      <div className="relative w-5 h-5">
        <Sun 
          size={20} 
          className={`absolute inset-0 transition-all duration-500 transform ${
            theme === 'dark' ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'
          }`} 
        />
        <Moon 
          size={20} 
          className={`absolute inset-0 transition-all duration-500 transform ${
            theme === 'dark' ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'
          }`} 
        />
      </div>
    </Button>
  );
};

export default ThemeSwitcher;
