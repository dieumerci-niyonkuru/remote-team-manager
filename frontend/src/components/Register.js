import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaBriefcase } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ROLES = ['viewer', 'developer', 'manager', 'owner', 'frontend', 'backend', 'devops', 'designer', 'qa', 'product', 'hr'];

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', password2: '', first_name: '', last_name: '', role: 'viewer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (formData.password !== formData.password2) { setError('Passwords do not match'); setLoading(false); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
    try {
      await register(formData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      let msg = 'Registration failed';
      if (err.response?.data) { const first = Object.values(err.response.data)[0]; msg = Array.isArray(first) ? first[0] : first; }
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&h=900&fit=crop')" }}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md z-10">
        <h2 className="text-3xl font-bold text-center mb-6 dark:text-white">Create Account</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="relative mb-3"><FaUser className="absolute left-3 top-3 text-gray-400" /><input type="text" name="username" placeholder="Username *" className="w-full pl-10 pr-3 py-2 border rounded-lg" value={formData.username} onChange={handleChange} required /></div>
          <div className="relative mb-3"><FaEnvelope className="absolute left-3 top-3 text-gray-400" /><input type="email" name="email" placeholder="Email *" className="w-full pl-10 pr-3 py-2 border rounded-lg" value={formData.email} onChange={handleChange} required /></div>
          <div className="relative mb-3"><FaUser className="absolute left-3 top-3 text-gray-400" /><input type="text" name="first_name" placeholder="First Name" className="w-full pl-10 pr-3 py-2 border rounded-lg" value={formData.first_name} onChange={handleChange} /></div>
          <div className="relative mb-3"><FaUser className="absolute left-3 top-3 text-gray-400" /><input type="text" name="last_name" placeholder="Last Name" className="w-full pl-10 pr-3 py-2 border rounded-lg" value={formData.last_name} onChange={handleChange} /></div>
          <div className="relative mb-3"><FaBriefcase className="absolute left-3 top-3 text-gray-400" /><select name="role" className="w-full pl-10 pr-3 py-2 border rounded-lg appearance-none" value={formData.role} onChange={handleChange}>{ROLES.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}</select></div>
          <div className="relative mb-3"><FaLock className="absolute left-3 top-3 text-gray-400" /><input type="password" name="password" placeholder="Password * (min 6 chars)" className="w-full pl-10 pr-3 py-2 border rounded-lg" value={formData.password} onChange={handleChange} required /></div>
          <div className="relative mb-4"><FaLock className="absolute left-3 top-3 text-gray-400" /><input type="password" name="password2" placeholder="Confirm Password *" className="w-full pl-10 pr-3 py-2 border rounded-lg" value={formData.password2} onChange={handleChange} required /></div>
          <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">{loading ? 'Registering...' : 'Register'}</button>
        </form>
        <p className="text-center text-gray-600 dark:text-gray-300 mt-4">Already have an account? <Link to="/login" className="text-purple-600 hover:underline">Login</Link></p>
      </motion.div>
    </div>
  );
};
export default Register;
