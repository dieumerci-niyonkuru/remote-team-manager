import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', password2: '', first_name: '', last_name: '', role: 'developer' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password2) { setError('Passwords do not match'); return; }
    try { await register(formData); navigate('/login'); }
    catch (err) { setError(err.response?.data?.detail || 'Registration failed'); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-blue-600 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Create Account</h2>
        <p className="text-center text-gray-500 mb-6">Join Remote Team Manager</p>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="Username" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3" value={formData.username} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3" value={formData.email} onChange={handleChange} required />
          <input type="text" name="first_name" placeholder="First Name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3" value={formData.first_name} onChange={handleChange} />
          <input type="text" name="last_name" placeholder="Last Name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3" value={formData.last_name} onChange={handleChange} />
          <select name="role" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3" value={formData.role} onChange={handleChange}>
            <option value="developer">Developer</option><option value="manager">Manager</option><option value="viewer">Viewer</option>
          </select>
          <input type="password" name="password" placeholder="Password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3" value={formData.password} onChange={handleChange} required />
          <input type="password" name="password2" placeholder="Confirm Password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4" value={formData.password2} onChange={handleChange} required />
          <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold py-2 rounded-lg hover:opacity-90 transition">Register</button>
        </form>
        <p className="text-center text-gray-600 mt-4">Already have an account? <Link to="/login" className="text-purple-600 hover:underline">Login</Link></p>
      </div>
    </div>
  );
};
export default Register;
