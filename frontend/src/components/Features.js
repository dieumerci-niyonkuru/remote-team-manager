import React from 'react';
import { Link } from 'react-router-dom';
const Features = () => (
  <div className="max-w-4xl mx-auto p-6">
    <h1 className="text-3xl font-bold mb-4">Features</h1>
    <p>Explore all the powerful features of Remote Team Manager.</p>
    <Link to="/" className="text-purple-600 mt-4 inline-block">← Back to Home</Link>
  </div>
);
export default Features;
