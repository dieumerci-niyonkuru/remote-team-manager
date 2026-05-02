import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTasks, FaComments, FaShieldAlt, FaCalendarAlt, FaChartLine, FaRobot, FaCloudUploadAlt, FaBell, FaUsers, FaGlobe, FaSync, FaVideo } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const Landing = () => {
  const { t } = useTranslation();
  const images = [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop',
  ];

  const features = [
    { icon: <FaTasks />, title: 'Task Management', desc: 'Kanban, subtasks, deadlines, progress tracking' },
    { icon: <FaComments />, title: 'Real‑time Chat', desc: 'Channels, mentions, reactions, file sharing' },
    { icon: <FaShieldAlt />, title: '2FA & Security', desc: 'Two‑factor authentication, data encryption' },
    { icon: <FaCalendarAlt />, title: 'Calendar & Integrations', desc: 'Google Calendar, Zoom, GitHub, Drive' },
    { icon: <FaChartLine />, title: 'Analytics & OKRs', desc: 'Burn-down charts, team goals, productivity' },
    { icon: <FaRobot />, title: 'AI Assistant', desc: 'Smart suggestions, meeting summaries, predictions' },
    { icon: <FaCloudUploadAlt />, title: 'File Storage', desc: 'Upload, versioning, auto‑organize' },
    { icon: <FaBell />, title: 'Smart Notifications', desc: 'Priority alerts, email + in‑app' },
    { icon: <FaUsers />, title: 'Time Tracking', desc: 'Task timer, idle detection, overload alerts' },
    { icon: <FaGlobe />, title: 'Offline Sync', desc: 'Work offline, sync when back online' },
    { icon: <FaSync />, title: 'Backup & Recovery', desc: 'Automated backups, restore points' },
    { icon: <FaVideo />, title: 'Voice/Video Calls', desc: 'Integrated calls with screen sharing' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero with background image */}
      <section className="relative text-white py-32 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-blue-700 opacity-95"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.h1 initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="text-5xl md:text-6xl font-bold mb-6">Remote Team Manager</motion.h1>
          <motion.p initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl mb-8">The all‑in‑one platform for distributed teams – project management, chat, HR, AI, and security.</motion.p>
          <motion.div whileHover={{ scale: 1.05 }}><Link to="/register" className="bg-white text-purple-700 px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition">Get Started Free</Link></motion.div>
        </div>
      </section>

      {/* Feature cards with images */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 dark:text-white">Powerful Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, idx) => (
            <motion.div key={idx} whileHover={{ y: -5 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
              <div className="text-4xl text-purple-600 mb-3">{f.icon}</div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gallery of online images (12+ images) */}
      <section className="py-20 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Our Team in Action</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <motion.img key={i} whileHover={{ scale: 1.05 }} src={img} alt="Team work" className="rounded-xl shadow-md object-cover h-48 w-full" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-4 dark:text-white">Ready to transform your team?</h2>
        <Link to="/register" className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition inline-block">Start Your Free Trial →</Link>
      </section>
    </div>
  );
};
export default Landing;
