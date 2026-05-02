import React from 'react';
import { Link } from 'react-router-dom';
const Analytics = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 text-center">
    <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop" alt="Analytics" className="rounded-xl shadow-lg mb-6 w-full" />
    <h1 className="text-3xl font-bold mb-4 dark:text-white">Analytics & OKRs</h1>
    <p className="text-gray-600 dark:text-gray-300 mb-6">Track team productivity, burn‑down charts, OKR progress, and custom reports.</p>
    <Link to="/features" className="text-purple-600 hover:underline">← Back to Features</Link>
  </div>
);
export default Analytics;
