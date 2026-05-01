import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';

const Landing = () => {
  const [hrNotifications, setHrNotifications] = useState([]);

  useEffect(() => {
    api.get('/notifications/').then(res => setHrNotifications(res.data.slice(0,3))).catch(()=>{});
  }, []);

  return (
    <div className="bg-white">
      {/* Hero with parallax effect */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="relative bg-gradient-to-br from-purple-800 to-blue-700 text-white py-32 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10">
          <motion.h1 initial={{ y: -50 }} animate={{ y: 0 }} className="text-6xl font-bold mb-4">Remote Team Manager</motion.h1>
          <motion.p initial={{ y: 50 }} animate={{ y: 0 }} className="text-xl max-w-2xl mx-auto mb-8">The all‑in‑one platform for distributed teams – project management, chat, HR, and AI.</motion.p>
          <motion.div whileHover={{ scale: 1.05 }}><Link to="/register" className="bg-white text-purple-700 px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition">Get Started Free</Link></motion.div>
        </div>
      </motion.section>

      {/* Features grid with icons */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Powerful Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[ {title:'Project Management', desc:'Kanban, tasks, subtasks, deadlines, and progress tracking', icon:'📋'},
             {title:'Real‑time Chat', desc:'Channels, direct messages, mentions, and file sharing', icon:'💬'},
             {title:'HR & Payroll', desc:'Employee profiles, job postings, payroll, and leave management', icon:'📄'},
             {title:'AI Assistant', desc:'Smart summaries, task suggestions, and natural language Q&A', icon:'🤖'},
             {title:'Role‑Based Access', desc:'Owner, Manager, Developer, Viewer + custom roles', icon:'🔐'},
             {title:'Analytics & Reports', desc:'Team productivity, workload distribution, and custom reports', icon:'📊'}
          ].map(feat => (
            <motion.div key={feat.title} whileHover={{ y: -5 }} className="bg-gray-50 p-6 rounded-2xl shadow text-center">
              <div className="text-5xl mb-3">{feat.icon}</div><h3 className="text-xl font-bold mb-2">{feat.title}</h3><p className="text-gray-600">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-100 py-20 px-6">
        <div className="max-w-6xl mx-auto"><h2 className="text-4xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow p-6 text-center"><h3 className="text-xl font-bold">Free</h3><p className="text-3xl font-bold my-2">$0</p><p className="text-gray-600 mb-6">Up to 5 users</p><Link to="/register" className="bg-purple-600 text-white px-6 py-2 rounded-full inline-block">Start</Link></div>
            <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-500 p-6 text-center relative"><div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">Popular</div><h3 className="text-xl font-bold">Pro</h3><p className="text-3xl font-bold my-2">$12</p><p className="text-gray-600 mb-6">Unlimited users + AI</p><Link to="/register" className="bg-purple-600 text-white px-6 py-2 rounded-full inline-block">Start Trial</Link></div>
            <div className="bg-white rounded-2xl shadow p-6 text-center"><h3 className="text-xl font-bold">Enterprise</h3><p className="text-3xl font-bold my-2">Custom</p><p className="text-gray-600 mb-6">SSO + dedicated support</p><Link to="/contact" className="bg-purple-600 text-white px-6 py-2 rounded-full inline-block">Contact</Link></div>
          </div>
        </div>
      </section>

      {/* HR Notifications board */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Latest HR Announcements</h2>
        {hrNotifications.length === 0 ? <p className="text-center text-gray-500">No announcements yet.</p> : (
          <div className="space-y-4">{hrNotifications.map(n => <div key={n.id} className="bg-white p-4 rounded-xl shadow"><p className="font-semibold">{n.actor_name} {n.verb}</p><p className="text-sm text-gray-500">{new Date(n.timestamp).toLocaleString()}</p></div>)}</div>
        )}
      </section>

      {/* About, Contact, Product Announcement (simplified) */}
      <section className="bg-gray-50 py-16 px-6 text-center"><h2 className="text-3xl font-bold mb-4">About Us</h2><p className="max-w-2xl mx-auto text-gray-700">We empower remote teams with an integrated platform that combines communication, project management, and HR.</p></section>
      <footer className="bg-gray-800 text-white py-8 text-center"><p>&copy; 2025 Remote Team Manager. All rights reserved. Built with Django + React.</p></footer>
    </div>
  );
};
export default Landing;
