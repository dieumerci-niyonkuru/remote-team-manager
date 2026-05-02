import React from 'react';
import { Link } from 'react-router-dom';
const RealTimeChat = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 text-center">
    <img src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=500&fit=crop" alt="Real-time Chat" className="rounded-xl shadow-lg mb-6 w-full" />
    <h1 className="text-3xl font-bold mb-4 dark:text-white">Real‑time Chat</h1>
    <p className="text-gray-600 dark:text-gray-300 mb-6">Channels, direct messages, @mentions, reactions, and file sharing – all in real time.</p>
    <Link to="/features" className="text-purple-600 hover:underline">← Back to Features</Link>
  </div>
);
export default RealTimeChat;
