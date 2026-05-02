import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaCogs, FaInfoCircle, FaEnvelope, FaDollarSign, FaBox } from 'react-icons/fa';

const Landing = () => {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', label: 'Home', icon: <FaHome /> },
    { id: 'features', label: 'Features', icon: <FaCogs /> },
    { id: 'about', label: 'About', icon: <FaInfoCircle /> },
    { id: 'contact', label: 'Contact', icon: <FaEnvelope /> },
    { id: 'pricing', label: 'Pricing', icon: <FaDollarSign /> },
    { id: 'product', label: 'Product', icon: <FaBox /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with logo and auth buttons */}
      <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-50">
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          🚀 RTM
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition">Login</Link>
          <Link to="/register" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">Sign Up</Link>
        </div>
      </header>

      {/* Tabs navigation */}
      <div className="flex flex-wrap justify-center gap-2 bg-white border-b px-4 py-3 sticky top-16 z-40">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${activeTab === tab.id ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="max-w-6xl mx-auto p-6">
        {activeTab === 'home' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-8">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop" alt="Team" className="w-full h-64 object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h1 className="text-5xl font-bold text-white">Remote Team Manager</h1>
              </div>
            </div>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">The all‑in‑one platform for distributed teams – project management, chat, HR, and AI.</p>
            <Link to="/register" className="bg-purple-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-105 inline-block">Get Started Free</Link>
          </motion.div>
        )}
        {activeTab === 'features' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-3 gap-8 py-12">
            {[ {title:'Task Management', desc:'Kanban boards, subtasks, time tracking.', icon:'📋'},
               {title:'Real‑time Chat', desc:'Channels, direct messages, mentions, reactions.', icon:'💬'},
               {title:'HR & Payroll', desc:'Employee profiles, job postings, payroll.', icon:'📄'},
               {title:'AI Assistant', desc:'Smart summaries, task suggestions.', icon:'🤖'},
               {title:'Role‑Based Access', desc:'Owner, Manager, Developer, etc.', icon:'🔐'},
               {title:'Analytics', desc:'Team productivity, workload reports.', icon:'📊'}
            ].map(f => (
              <div key={f.title} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
                <div className="text-5xl mb-3">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        )}
        {activeTab === 'about' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-6">About Us</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">We empower remote teams with an integrated platform that combines communication, project management, and HR. Founded in 2025, we serve teams in 50+ countries.</p>
          </motion.div>
        )}
        {activeTab === 'contact' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-center mb-6">Contact Us</h2>
            <form className="bg-white p-6 rounded-2xl shadow-lg">
              <input type="text" placeholder="Name" className="w-full border rounded-lg p-2 mb-4" />
              <input type="email" placeholder="Email" className="w-full border rounded-lg p-2 mb-4" />
              <textarea rows="4" placeholder="Message" className="w-full border rounded-lg p-2 mb-4"></textarea>
              <button className="w-full bg-purple-600 text-white py-2 rounded-lg">Send</button>
            </form>
          </motion.div>
        )}
        {activeTab === 'pricing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-3 gap-8 py-12">
            <div className="bg-white rounded-2xl shadow p-6 text-center"><h3 className="text-xl font-bold">Free</h3><p className="text-3xl font-bold my-2">$0</p><p className="text-gray-600 mb-6">Up to 5 users</p><Link to="/register" className="bg-purple-600 text-white px-6 py-2 rounded-full inline-block">Start</Link></div>
            <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-500 p-6 text-center relative"><div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">Popular</div><h3 className="text-xl font-bold">Pro</h3><p className="text-3xl font-bold my-2">$12</p><p className="text-gray-600 mb-6">Unlimited users + AI</p><Link to="/register" className="bg-purple-600 text-white px-6 py-2 rounded-full inline-block">Start Trial</Link></div>
            <div className="bg-white rounded-2xl shadow p-6 text-center"><h3 className="text-xl font-bold">Enterprise</h3><p className="text-3xl font-bold my-2">Custom</p><p className="text-gray-600 mb-6">SSO + dedicated support</p><Link to="/contact" className="bg-purple-600 text-white px-6 py-2 rounded-full inline-block">Contact</Link></div>
          </motion.div>
        )}
        {activeTab === 'product' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-6">Our Product</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">Remote Team Manager is a SaaS platform that combines everything your team needs: tasks, chat, HR, and AI. Try it today.</p>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-8 mt-12">
        <p>&copy; 2025 Remote Team Manager. Built with Django + React. Empowering remote teams worldwide.</p>
      </footer>
    </div>
  );
};
export default Landing;
