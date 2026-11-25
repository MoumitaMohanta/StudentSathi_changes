/* import React from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ setIsOpen }) => {
  const { darkMode, toggleDarkMode, user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 z-40">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between lg:pl-[calc(16rem+2rem)]">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center space-x-4">
          <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">
            {user?.email}
          </span>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};
*/


import React from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ setIsOpen }) => {
  const { darkMode, toggleDarkMode, user } = useAuth();

  return (
    <header
      className="fixed top-0 left-0 right-0 h-16 z-40
        bg-white/80 dark:bg-dark-800/80 backdrop-blur
        border-b border-gray-200 dark:border-dark-700
        lg:left-64"
    >
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-dark-700 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={22} />
        </button>

        {/* Spacer to keep right side aligned on desktop */}
        <div className="hidden lg:block" />

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 truncate max-w-[180px]">
            {user?.email}
          </span>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400
                       hover:bg-gray-100 dark:hover:bg-dark-700"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};
