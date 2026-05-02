import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowUp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api';

const Footer = () => {
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subscribeEmail) return;
    setSubscribing(true);
    try {
      await api.post('/contact/subscribe/', { email: subscribeEmail });
      toast.success('Subscribed! Thank you.');
      setSubscribeEmail('');
    } catch (err) {
      toast.error('Subscription failed. Try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src="https://img.icons8.com/fluency/48/teamwork.png" alt="Logo" className="w-8 h-8" />
            <span className="text-xl font-bold text-white">Remote Team Manager</span>
          </div>
          <p className="text-sm">Empowering remote teams worldwide with seamless collaboration.</p>
          <div className="flex space-x-4 text-xl mt-4">
            <a href="https://www.linkedin.com/in/dieu-merci-niyonkuru-7725b1363/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400"><FaLinkedin /></a>
            <a href="https://github.com/dieumerci-niyonkuru" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400"><FaGithub /></a>
            <a href="https://x.com/dieumercin21" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400"><FaTwitter /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-purple-400">Home</Link></li>
            <li><Link to="/login" className="hover:text-purple-400">Login</Link></li>
            <li><Link to="/register" className="hover:text-purple-400">Sign Up</Link></li>
            <li><a href="#features" className="hover:text-purple-400">Features</a></li>
            <li><a href="#pricing" className="hover:text-purple-400">Pricing</a></li>
          </ul>
        </div>

        {/* Rwanda Contact & Interactive Map */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Contact & Map</h4>
          <div className="flex items-center gap-2 mb-2">
            <FaEnvelope className="text-purple-400" />
            <a href="mailto:dieumercin21@gmail.com" className="text-sm hover:text-purple-400">dieumercin21@gmail.com</a>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <FaPhone className="text-purple-400" />
            <a href="tel:+250793516483" className="text-sm hover:text-purple-400">+250 793 516 483</a>
          </div>
          <div className="flex items-start gap-2 mb-4">
            <FaMapMarkerAlt className="text-purple-400 mt-1" />
            <span className="text-sm">Kigali, Rwanda</span>
          </div>
          {/* Embed the full interactive Google Map (your provided iframe) */}
          <div className="rounded-md overflow-hidden shadow-md">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255203.55263329137!2d30.12724445!3d-1.9297706000000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4258ed8e797%3A0xf32b36a5411d0bc8!2sKigali!5e0!3m2!1sen!2srw!4v1777735106580!5m2!1sen!2srw"
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Rwanda Map"
              className="w-full"
            ></iframe>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Stay Updated</h4>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
            <input type="email" placeholder="Your email" className="p-2 rounded text-gray-800" value={subscribeEmail} onChange={e => setSubscribeEmail(e.target.value)} required />
            <button type="submit" disabled={subscribing} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition">
              {subscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar with legal links + back-to-top */}
      <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
        <div className="flex flex-wrap justify-center gap-4 mb-2">
          <Link to="/terms" className="hover:text-purple-400">Terms</Link>
          <Link to="/privacy" className="hover:text-purple-400">Privacy</Link>
          <Link to="/security" className="hover:text-purple-400">Security</Link>
          <Link to="/status" className="hover:text-purple-400">Status</Link>
          <Link to="/community" className="hover:text-purple-400">Community</Link>
          <Link to="/docs" className="hover:text-purple-400">Docs</Link>
          <button onClick={scrollToTop} className="flex items-center gap-1 hover:text-purple-400">
            <FaArrowUp /> Back to Top
          </button>
        </div>
        <p>&copy; {new Date().getFullYear()} Remote Team Manager. All rights reserved.</p>
      </div>
    </footer>
  );
};
export default Footer;
