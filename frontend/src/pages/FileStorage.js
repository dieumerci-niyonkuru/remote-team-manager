import React from 'react';
import { Link } from 'react-router-dom';
const FileStorage = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 text-center">
    <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=500&fit=crop" alt="File Storage" className="rounded-xl shadow-lg mb-6 w-full" />
    <h1 className="text-3xl font-bold mb-4 dark:text-white">File Storage</h1>
    <p className="text-gray-600 dark:text-gray-300 mb-6">Upload, version, and organize files by project. Full history and auto‑tagging.</p>
    <Link to="/features" className="text-purple-600 hover:underline">← Back to Features</Link>
  </div>
);
export default FileStorage;
