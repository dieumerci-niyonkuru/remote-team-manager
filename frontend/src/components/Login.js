import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await login(username, password); navigate('/dashboard'); }
    catch (err) { setError('Invalid credentials'); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-blue-600">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Welcome Back</h2>
        <p className="text-center text-gray-500 mb-6">Sign in to your account</p>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="password" placeholder="Password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-6" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold py-2 rounded-lg hover:opacity-90 transition">Login</button>
        </form>
        <p className="text-center text-gray-600 mt-4">Don't have an account? <Link to="/register" className="text-purple-600 hover:underline">Register</Link></p>
      </div>
    </div>
  );
};
export default Login;
