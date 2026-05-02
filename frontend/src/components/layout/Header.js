import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FaSun, FaMoon, FaGlobe, FaRobot, FaBars, FaTimes } from 'react-icons/fa';

const Header = ({ onOpenAI }) => {
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">🚀 RTM</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {!isDashboard && <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-purple-600">{t('home')}</Link>}
            {!isDashboard && <Link to="/features" className="text-gray-700 dark:text-gray-200 hover:text-purple-600">{t('features')}</Link>}
            {!isDashboard && <Link to="/pricing" className="text-gray-700 dark:text-gray-200 hover:text-purple-600">{t('pricing')}</Link>}
            {!isDashboard && <Link to="/contact" className="text-gray-700 dark:text-gray-200 hover:text-purple-600">{t('contact')}</Link>}
            {user && <Link to="/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-purple-600">{t('dashboard')}</Link>}
          </nav>

          {/* Right side: dark mode, language, AI, auth buttons */}
          <div className="flex items-center space-x-3">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              {darkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-700" />}
            </button>
            <button onClick={toggleLanguage} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1">
              <FaGlobe /> {i18n.language === 'en' ? 'FR' : 'EN'}
            </button>
            <button onClick={onOpenAI} className="p-2 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 hover:bg-purple-200">
              <FaRobot />
            </button>
            {user ? (
              <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
                {t('logout')}
              </button>
            ) : (
              !isAuthPage && (
                <div className="flex space-x-2">
                  <Link to="/login" className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition">{t('login')}</Link>
                  <Link to="/register" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">{t('register')}</Link>
                </div>
              )
            )}
            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-md">
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t py-2">
          <nav className="flex flex-col space-y-2 px-4">
            {!isDashboard && <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-2">{t('home')}</Link>}
            {!isDashboard && <Link to="/features" onClick={() => setMobileMenuOpen(false)} className="py-2">{t('features')}</Link>}
            {!isDashboard && <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="py-2">{t('pricing')}</Link>}
            {!isDashboard && <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="py-2">{t('contact')}</Link>}
            {user && <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="py-2">{t('dashboard')}</Link>}
          </nav>
        </div>
      )}
    </header>
  );
};
export default Header;
