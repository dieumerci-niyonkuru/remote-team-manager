import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaHome } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [bgImage, setBgImage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const bgImages = [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&h=900&fit=crop'
  ];

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * bgImages.length);
    setBgImage(bgImages[randomIndex]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Back to Home button */}
        <div className="mb-4 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 transition">
            <FaHome /> Back to Home
          </Link>
        </div>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <img src="https://img.icons8.com/fluency/48/teamwork.png" alt="Logo" className="w-12 h-12 mx-auto mb-2" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome Back</h2>
            <p className="text-gray-500 dark:text-gray-400">Sign in to your account</p>
          </div>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input type="text" placeholder="Username or Email" className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="relative mb-6">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full pl-10 pr-10 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition">Login</button>
          </form>
          <p className="text-center text-gray-600 dark:text-gray-300 mt-4">Don't have an account? <Link to="/register" className="text-purple-600 hover:underline">Sign up</Link></p>
        </motion.div>
      </div>
    </div>
  );
};
export default Login;
