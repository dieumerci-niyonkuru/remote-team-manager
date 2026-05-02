import React from 'react';
import { Link } from 'react-router-dom';
const Resources = () => (
  <div className="max-w-7xl mx-auto px-4 py-16">
    <h1 className="text-4xl font-bold text-center mb-12 dark:text-white">Resources</h1>
    <div className="grid md:grid-cols-3 gap-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center"><img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=200&fit=crop" alt="Blog" className="rounded-lg mb-4 w-full h-32 object-cover" /><h2 className="text-xl font-bold mb-2 dark:text-white">Blog</h2><p className="text-gray-600 dark:text-gray-300">Insights on remote work and productivity.</p><Link to="/blog" className="mt-4 inline-block text-purple-600">Read Blog →</Link></div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center"><img src="https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=400&h=200&fit=crop" alt="Support" className="rounded-lg mb-4 w-full h-32 object-cover" /><h2 className="text-xl font-bold mb-2 dark:text-white">Support</h2><p className="text-gray-600 dark:text-gray-300">24/7 help center and ticket system.</p><Link to="/support" className="mt-4 inline-block text-purple-600">Get Help →</Link></div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center"><img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop" alt="Docs" className="rounded-lg mb-4 w-full h-32 object-cover" /><h2 className="text-xl font-bold mb-2 dark:text-white">Documentation</h2><p className="text-gray-600 dark:text-gray-300">API references, user guides, and tutorials.</p><Link to="/docs" className="mt-4 inline-block text-purple-600">Read Docs →</Link></div>
    </div>
    <div className="text-center mt-8"><Link to="/" className="text-purple-600 hover:underline">← Back to Home</Link></div>
  </div>
);
export default Resources;
