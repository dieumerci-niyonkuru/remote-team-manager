import React from 'react';
import { Link } from 'react-router-dom';
const PricingEnterprise = () => (
  <div className="max-w-2xl mx-auto px-4 py-16 text-center">
    <h1 className="text-3xl font-bold mb-4 dark:text-white">Enterprise Plan</h1>
    <p className="text-gray-600 dark:text-gray-300 mb-6">Custom pricing, SSO, dedicated account manager, on‑premise deployment.</p>
    <Link to="/contact" className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700">Contact Sales</Link>
    <div className="mt-4"><Link to="/pricing" className="text-purple-600 hover:underline">← Back to Pricing</Link></div>
  </div>
);
export default PricingEnterprise;
