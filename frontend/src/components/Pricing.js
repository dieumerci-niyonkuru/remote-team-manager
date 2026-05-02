import React from 'react';
import { Link } from 'react-router-dom';
const Pricing = () => (
  <div className="max-w-4xl mx-auto p-6">
    <h1 className="text-3xl font-bold mb-4">Pricing Plans</h1>
    <p>Choose the plan that fits your team.</p>
    <Link to="/" className="text-purple-600 mt-4 inline-block">← Back to Home</Link>
  </div>
);
export default Pricing;
