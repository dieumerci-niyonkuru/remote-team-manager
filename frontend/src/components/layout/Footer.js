import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaLinkedin, FaGithub, FaFacebook, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-gray-300 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Remote Team Manager</h3>
            <p className="text-sm">Empowering remote teams worldwide.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-purple-400 transition">Home</Link></li>
              <li><Link to="/features" className="hover:text-purple-400 transition">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-purple-400 transition">Pricing</Link></li>
              <li><Link to="/contact" className="hover:text-purple-400 transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Follow Us</h4>
            <div className="flex space-x-4 text-xl">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400"><FaTwitter /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400"><FaLinkedin /></a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400"><FaGithub /></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400"><FaFacebook /></a>
              <a href="mailto:support@rtm.com" className="hover:text-purple-400"><FaEnvelope /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 pt-4 text-center text-sm">
          &copy; {new Date().getFullYear()} Remote Team Manager. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
export default Footer;
