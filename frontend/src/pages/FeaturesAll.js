import React from 'react';
import { Link } from 'react-router-dom';
import { FaTasks, FaComments, FaShieldAlt, FaChartLine, FaRobot, FaCloudUploadAlt } from 'react-icons/fa';

const FeaturesAll = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white">All Features</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { title: "Task Management", desc: "Kanban boards, subtasks, deadlines, progress tracking.", icon: <FaTasks className="text-5xl text-purple-600" />, img: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=600&h=400&fit=crop" },
          { title: "Real‑time Chat", desc: "Channels, mentions, reactions, file sharing.", icon: <FaComments className="text-5xl text-purple-600" />, img: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=400&fit=crop" },
          { title: "2FA & Security", desc: "Two‑factor authentication, data encryption, audit logs.", icon: <FaShieldAlt className="text-5xl text-purple-600" />, img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=400&fit=crop" },
          { title: "Analytics & OKRs", desc: "Burn-down charts, team goals, productivity dashboards.", icon: <FaChartLine className="text-5xl text-purple-600" />, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop" },
          { title: "AI Assistant", desc: "Smart suggestions, meeting summaries, predictions.", icon: <FaRobot className="text-5xl text-purple-600" />, img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop" },
          { title: "File Storage", desc: "Upload, versioning, auto‑organize by project.", icon: <FaCloudUploadAlt className="text-5xl text-purple-600" />, img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop" }
        ].map((f, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <img src={f.img} alt={f.title} className="w-full h-48 object-cover" />
            <div className="p-6 text-center">
              <div className="flex justify-center mb-3">{f.icon}</div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-8"><Link to="/" className="text-purple-600 hover:underline">← Back to Home</Link></div>
    </div>
  );
};
export default FeaturesAll;
