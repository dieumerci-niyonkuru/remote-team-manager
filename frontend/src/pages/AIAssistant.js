import React from 'react';
import { Link } from 'react-router-dom';
const AIAssistantPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 text-center">
    <img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=500&fit=crop" alt="AI Assistant" className="rounded-xl shadow-lg mb-6 w-full" />
    <h1 className="text-3xl font-bold mb-4 dark:text-white">AI Assistant</h1>
    <p className="text-gray-600 dark:text-gray-300 mb-6">Smart task suggestions, meeting summaries, deadline predictions, and automated reports.</p>
    <Link to="/features" className="text-purple-600 hover:underline">← Back to Features</Link>
  </div>
);
export default AIAssistantPage;
