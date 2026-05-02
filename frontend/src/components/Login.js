import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [error, setError] = useState('');
  const [requireOtp, setRequireOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (requireOtp) {
        await login(username, password, otpToken);
        navigate('/dashboard');
      } else {
        try {
          await login(username, password);
          navigate('/dashboard');
        } catch (err) {
          if (err.response?.data?.detail === '2FA token required') {
            setRequireOtp(true);
            setError('2FA token required');
          } else {
            setError('Invalid username or password');
          }
        }
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&h=900&fit=crop')" }}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md z-10">
        <h2 className="text-3xl font-bold text-center mb-6 dark:text-white">Welcome Back</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="relative mb-4"><FaEnvelope className="absolute left-3 top-3 text-gray-400" /><input type="text" placeholder="Username or Email" className="w-full pl-10 pr-3 py-2 border rounded-lg" value={username} onChange={e => setUsername(e.target.value)} required /></div>
          <div className="relative mb-4"><FaLock className="absolute left-3 top-3 text-gray-400" /><input type="password" placeholder="Password" className="w-full pl-10 pr-3 py-2 border rounded-lg" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          {requireOtp && <div className="relative mb-4"><FaShieldAlt className="absolute left-3 top-3 text-gray-400" /><input type="text" placeholder="6-digit OTP" className="w-full pl-10 pr-3 py-2 border rounded-lg" value={otpToken} onChange={e => setOtpToken(e.target.value)} required /></div>}
          <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <p className="text-center text-gray-600 dark:text-gray-300 mt-4">Don't have an account? <Link to="/register" className="text-purple-600 hover:underline">Register</Link></p>
      </motion.div>
    </div>
  );
};
export default Login;
