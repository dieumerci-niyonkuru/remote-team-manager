import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaTasks, FaComments, FaShieldAlt, FaChartLine, FaRobot, FaCloudUploadAlt,
  FaUsers, FaGithub, FaTwitter, FaLinkedin, FaFacebook, FaArrowRight,
  FaBars, FaTimes
} from 'react-icons/fa';

const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const featuresRef = useRef(null);
  const pricingRef = useRef(null);
  const contactRef = useRef(null);

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src="https://img.icons8.com/fluency/48/teamwork.png" alt="Logo" className="w-8 h-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">RTM</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-gray-700 dark:text-gray-200 hover:text-purple-600">Home</button>
              <button onClick={() => scrollTo(featuresRef)} className="text-gray-700 dark:text-gray-200 hover:text-purple-600">Features</button>
              <button onClick={() => scrollTo(pricingRef)} className="text-gray-700 dark:text-gray-200 hover:text-purple-600">Pricing</button>
              <button onClick={() => scrollTo(contactRef)} className="text-gray-700 dark:text-gray-200 hover:text-purple-600">Contact</button>
            </nav>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-purple-600 border border-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50">Login</Link>
              <Link to="/register" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Sign Up</Link>
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-700 dark:text-gray-200">
                {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t py-2">
            <nav className="flex flex-col space-y-2 px-4 py-2">
              <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMenuOpen(false); }}>Home</button>
              <button onClick={() => { scrollTo(featuresRef); setMenuOpen(false); }}>Features</button>
              <button onClick={() => { scrollTo(pricingRef); setMenuOpen(false); }}>Pricing</button>
              <button onClick={() => { scrollTo(contactRef); setMenuOpen(false); }}>Contact</button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-800">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <motion.h1 initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl md:text-6xl font-bold text-white mb-6">
            Remote Team Manager
          </motion.h1>
          <motion.p initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl text-gray-200 max-w-2xl mx-auto mb-8">
            The all‑in‑one collaboration hub for modern teams – project management, real‑time chat, HR, and AI.
          </motion.p>
          <motion.div whileHover={{ scale: 1.05 }} className="flex justify-center gap-4 flex-wrap">
            <Link to="/register" className="bg-white text-purple-700 px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition">
              Get Started Free <FaArrowRight className="inline ml-2" />
            </Link>
            <button onClick={() => scrollTo(featuresRef)} className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition">
              Learn More
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 dark:text-white">Powerful Features</h2>
            <p className="text-gray-600 dark:text-gray-300">Everything your remote team needs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Task Management", desc: "Kanban, subtasks, deadlines, progress tracking", img: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop", icon: "📋" },
              { title: "Real‑time Chat", desc: "Channels, mentions, reactions, file sharing", img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop", icon: "💬" },
              { title: "2FA & Security", desc: "Two-factor authentication, data encryption", img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=200&fit=crop", icon: "🔐" },
              { title: "Analytics & OKRs", desc: "Burn-down charts, team goals, productivity", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop", icon: "📊" },
              { title: "AI Assistant", desc: "Smart suggestions, meeting summaries, predictions", img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop", icon: "🤖" },
              { title: "File Storage", desc: "Upload, versioning, auto-organize", img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=200&fit=crop", icon: "☁️" }
            ].map((f, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <img src={f.img} alt={f.title} className="w-full h-40 object-cover" />
                <div className="p-6 text-center">
                  <div className="text-4xl mb-3">{f.icon}</div>
                  <h3 className="text-xl font-bold mb-2 dark:text-white">{f.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
          <div><div className="text-5xl font-bold text-purple-600">10k+</div><p>Active Teams</p></div>
          <div><div className="text-5xl font-bold text-purple-600">500k+</div><p>Tasks Completed</p></div>
          <div><div className="text-5xl font-bold text-purple-600">99.9%</div><p>Uptime</p></div>
        </div>
      </section>

      {/* Pricing */}
      <section ref={pricingRef} className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12 dark:text-white">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6"><h3 className="text-xl font-bold">Free</h3><p className="text-3xl font-bold my-4">$0</p><p className="mb-6">Up to 5 users</p><Link to="/register" className="bg-purple-600 text-white px-6 py-2 rounded-full inline-block">Start</Link></div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-2 border-purple-500 p-6 relative"><div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">Popular</div><h3 className="text-xl font-bold">Pro</h3><p className="text-3xl font-bold my-4">$12</p><p className="mb-6">Unlimited users + AI</p><Link to="/register" className="bg-purple-600 text-white px-6 py-2 rounded-full inline-block">Start Trial</Link></div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6"><h3 className="text-xl font-bold">Enterprise</h3><p className="text-3xl font-bold my-4">Custom</p><p className="mb-6">SSO + dedicated support</p><button onClick={() => scrollTo(contactRef)} className="bg-purple-600 text-white px-6 py-2 rounded-full">Contact</button></div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={contactRef} className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-lg mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 dark:text-white">Contact Us</h2>
          <form className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow">
            <input type="text" placeholder="Name" className="w-full border rounded-lg p-3 mb-4 dark:bg-gray-700" />
            <input type="email" placeholder="Email" className="w-full border rounded-lg p-3 mb-4 dark:bg-gray-700" />
            <textarea rows="4" placeholder="Message" className="w-full border rounded-lg p-3 mb-4 dark:bg-gray-700"></textarea>
            <button className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 rounded-lg">Send</button>
          </form>
        </div>
      </section>

      <!-- No footer here – global footer from App.js will be used -->
    </div>
  );
};
export default Landing;
