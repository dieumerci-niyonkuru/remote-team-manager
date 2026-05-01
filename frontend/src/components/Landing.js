import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-700 to-blue-600 text-white py-20 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">Remote Team Manager</h1>
        <p className="text-xl max-w-2xl mx-auto mb-8">The all‑in‑one platform for distributed teams – project management, chat, HR, and AI assistance.</p>
        <div className="space-x-4">
          <Link to="/login" className="bg-white text-purple-700 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition">Login</Link>
          <Link to="/register" className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-700 transition">Sign Up</Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 border rounded-xl shadow-sm"><div className="text-4xl mb-3">📋</div><h3 className="text-xl font-semibold mb-2">Task Management</h3><p>Kanban boards, subtasks, time tracking, and progress analytics.</p></div>
          <div className="text-center p-6 border rounded-xl shadow-sm"><div className="text-4xl mb-3">💬</div><h3 className="text-xl font-semibold mb-2">Real‑time Chat</h3><p>Channels, direct messages, reactions, and file sharing.</p></div>
          <div className="text-center p-6 border rounded-xl shadow-sm"><div className="text-4xl mb-3">📄</div><h3 className="text-xl font-semibold mb-2">HR & Payroll</h3><p>Employee profiles, job postings, payroll management.</p></div>
          <div className="text-center p-6 border rounded-xl shadow-sm"><div className="text-4xl mb-3">🤖</div><h3 className="text-xl font-semibold mb-2">AI Assistant</h3><p>Smart summaries, task suggestions, and natural language Q&A.</p></div>
          <div className="text-center p-6 border rounded-xl shadow-sm"><div className="text-4xl mb-3">🔐</div><h3 className="text-xl font-semibold mb-2">Role‑Based Access</h3><p>Owner, Manager, Developer, Viewer – full control.</p></div>
          <div className="text-center p-6 border rounded-xl shadow-sm"><div className="text-4xl mb-3">📊</div><h3 className="text-xl font-semibold mb-2">Analytics</h3><p>Team productivity, workload distribution, and custom reports.</p></div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow p-6 text-center"><h3 className="text-xl font-bold mb-2">Free</h3><p className="text-3xl font-bold mb-4">$0</p><p className="text-gray-600 mb-6">Up to 5 users, basic features</p><Link to="/register" className="bg-purple-600 text-white px-6 py-2 rounded-lg inline-block">Get Started</Link></div>
            <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-500 p-6 text-center relative"><div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">Popular</div><h3 className="text-xl font-bold mb-2">Pro</h3><p className="text-3xl font-bold mb-4">$12</p><p className="text-gray-600 mb-6">Unlimited users, advanced features + AI</p><Link to="/register" className="bg-purple-600 text-white px-6 py-2 rounded-lg inline-block">Start Free Trial</Link></div>
            <div className="bg-white rounded-2xl shadow p-6 text-center"><h3 className="text-xl font-bold mb-2">Enterprise</h3><p className="text-3xl font-bold mb-4">Custom</p><p className="text-gray-600 mb-6">SSO, dedicated support, on‑premise</p><Link to="/contact" className="bg-purple-600 text-white px-6 py-2 rounded-lg inline-block">Contact Sales</Link></div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">About Us</h2>
        <p className="text-gray-700 text-lg">We believe remote work should be effortless. Remote Team Manager combines everything your team needs – from daily tasks to strategic HR – in one secure, intuitive platform. Used by teams in 50+ countries.</p>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 text-center">
        <p>&copy; 2025 Remote Team Manager. Built with Django + React. <br /> Empowering remote teams worldwide.</p>
      </footer>
    </div>
  );
};
export default Landing;
