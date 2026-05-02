import React from 'react';
import { Link } from 'react-router-dom';
const PricingFree = () => (
  <div className="max-w-2xl mx-auto px-4 py-16 text-center">
    <h1 className="text-3xl font-bold mb-4 dark:text-white">Free Plan</h1>
    <p className="text-gray-600 dark:text-gray-300 mb-6">Up to 5 users, basic features, 2GB storage. Perfect for small teams.</p>
    <Link to="/register" className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700">Sign Up Free</Link>
    <div className="mt-4"><Link to="/pricing" className="text-purple-600 hover:underline">← Back to Pricing</Link></div>
  </div>
);
export default PricingFree;
