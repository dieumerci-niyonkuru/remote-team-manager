import React from 'react';
import { Link } from 'react-router-dom';
const PricingAll = () => (
  <div className="max-w-7xl mx-auto px-4 py-16">
    <h1 className="text-4xl font-bold text-center mb-12 dark:text-white">Pricing Plans</h1>
    <div className="grid md:grid-cols-3 gap-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 text-center"><h3 className="text-xl font-bold">Free</h3><p className="text-3xl font-bold my-4">$0</p><p className="mb-6">Up to 5 users</p><Link to="/register" className="bg-purple-600 text-white px-6 py-2 rounded-full inline-block">Start</Link></div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-purple-500 p-6 text-center relative"><div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">Popular</div><h3 className="text-xl font-bold">Pro</h3><p className="text-3xl font-bold my-4">$12</p><p className="mb-6">Unlimited users + AI</p><Link to="/register" className="bg-purple-600 text-white px-6 py-2 rounded-full inline-block">Start Trial</Link></div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 text-center"><h3 className="text-xl font-bold">Enterprise</h3><p className="text-3xl font-bold my-4">Custom</p><p className="mb-6">SSO + dedicated support</p><Link to="/contact" className="bg-purple-600 text-white px-6 py-2 rounded-full inline-block">Contact</Link></div>
    </div>
    <div className="text-center mt-8"><Link to="/" className="text-purple-600 hover:underline">← Back to Home</Link></div>
  </div>
);
export default PricingAll;
