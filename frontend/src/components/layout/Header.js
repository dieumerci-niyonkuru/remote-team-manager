import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FaSun, FaMoon, FaGlobe, FaRobot, FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';

const Header = ({ onOpenAI }) => {
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

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
          <Link to="/" className="flex items-center space-x-2">
            <img src="https://img.icons8.com/fluency/48/teamwork.png" alt="Logo" className="w-8 h-8" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">RTM</span>
          </Link>

          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-purple-600 transition">Home</Link>

            {/* Features Dropdown */}
            <div className="relative" onMouseEnter={() => setFeaturesOpen(true)} onMouseLeave={() => setFeaturesOpen(false)}>
              <button className="text-gray-700 dark:text-gray-200 hover:text-purple-600 transition flex items-center gap-1">
                Features <FaChevronDown size={12} />
              </button>
              {featuresOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-20 border border-gray-200 dark:border-gray-700">
                  <Link to="/features" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">All Features</Link>
                  <Link to="/task-management" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Task Management</Link>
                  <Link to="/real-time-chat" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Real-time Chat</Link>
                  <Link to="/analytics" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Analytics</Link>
                  <Link to="/ai-assistant" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">AI Assistant</Link>
                  <Link to="/file-storage" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">File Storage</Link>
                </div>
              )}
            </div>

            {/* Pricing Dropdown */}
            <div className="relative" onMouseEnter={() => setPricingOpen(true)} onMouseLeave={() => setPricingOpen(false)}>
              <button className="text-gray-700 dark:text-gray-200 hover:text-purple-600 transition flex items-center gap-1">
                Pricing <FaChevronDown size={12} />
              </button>
              {pricingOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-20 border border-gray-200 dark:border-gray-700">
                  <Link to="/pricing" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">All Plans</Link>
                  <Link to="/pricing/free" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Free</Link>
                  <Link to="/pricing/pro" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Pro</Link>
                  <Link to="/pricing/enterprise" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Enterprise</Link>
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div className="relative" onMouseEnter={() => setResourcesOpen(true)} onMouseLeave={() => setResourcesOpen(false)}>
              <button className="text-gray-700 dark:text-gray-200 hover:text-purple-600 transition flex items-center gap-1">
                Resources <FaChevronDown size={12} />
              </button>
              {resourcesOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-20 border border-gray-200 dark:border-gray-700">
                  <Link to="/resources" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Overview</Link>
                  <Link to="/blog" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Blog</Link>
                  <Link to="/support" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Support</Link>
                  <Link to="/docs" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Documentation</Link>
                </div>
              )}
            </div>

            <Link to="/contact" className="text-gray-700 dark:text-gray-200 hover:text-purple-600 transition">Contact</Link>
          </nav>

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
                Logout
              </button>
            ) : (
              !isAuthPage && (
                <div className="flex space-x-2">
                  <Link to="/login" className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition">Login</Link>
                  <Link to="/register" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">Sign Up</Link>
                </div>
              )
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-md">
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t py-2">
          <nav className="flex flex-col space-y-2 px-4 py-2">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/features" onClick={() => setMobileMenuOpen(false)}>Features</Link>
            <Link to="/pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
            <Link to="/resources" onClick={() => setMobileMenuOpen(false)}>Resources</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            {!user && (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
              </>
            )}
            {user && <button onClick={logout}>Logout</button>}
          </nav>
        </div>
      )}
    </header>
  );
};
export default Header;
