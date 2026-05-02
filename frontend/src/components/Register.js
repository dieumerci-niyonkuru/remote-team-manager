import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaBriefcase, FaEye, FaEyeSlash, FaHome } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ROLES = ['viewer', 'developer', 'manager', 'owner', 'frontend', 'backend', 'devops', 'designer', 'qa', 'product', 'hr'];

const Register = () => {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', password2: '', first_name: '', last_name: '', role: 'viewer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [bgImage, setBgImage] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const bgImages = [
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=900&fit=crop'
  ];

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * bgImages.length);
    setBgImage(bgImages[randomIndex]);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'password') {
      let score = 0;
      const pwd = e.target.value;
      if (pwd.length >= 6) score++;
      if (pwd.match(/[A-Z]/)) score++;
      if (pwd.match(/[0-9]/)) score++;
      if (pwd.match(/[^a-zA-Z0-9]/)) score++;
      setPasswordStrength(Math.min(score, 4));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    try {
      await register(formData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      let msg = 'Registration failed';
      if (err.response?.data) {
        const first = Object.values(err.response.data)[0];
        msg = Array.isArray(first) ? first[0] : first;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];
  const strengthText = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="mb-4 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 transition">
            <FaHome /> Back to Home
          </Link>
        </div>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <img src="https://img.icons8.com/fluency/48/teamwork.png" alt="Logo" className="w-12 h-12 mx-auto mb-2" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Create Account</h2>
            <p className="text-gray-500 dark:text-gray-400">Join Remote Team Manager</p>
          </div>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input type="text" name="username" placeholder="Username *" className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" value={formData.username} onChange={handleChange} required />
            </div>
            <div className="relative mb-4">
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
              <input type="email" name="email" placeholder="Email *" className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="relative mb-4">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input type="text" name="first_name" placeholder="First Name" className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" value={formData.first_name} onChange={handleChange} />
            </div>
            <div className="relative mb-4">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input type="text" name="last_name" placeholder="Last Name" className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" value={formData.last_name} onChange={handleChange} />
            </div>
            <div className="relative mb-4">
              <FaBriefcase className="absolute left-3 top-3 text-gray-400" />
              <select name="role" className="w-full pl-10 pr-3 py-2 border rounded-lg appearance-none dark:bg-gray-700 dark:border-gray-600" value={formData.role} onChange={handleChange}>
                {ROLES.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="relative mb-2">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Password * (min 6 chars)" className="w-full pl-10 pr-10 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" value={formData.password} onChange={handleChange} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formData.password && (
              <div className="mb-3">
                <div className="flex gap-1 h-1.5 mt-1 mb-1">
                  {[0,1,2,3].map(i => <div key={i} className={`flex-1 rounded-full ${i < passwordStrength ? strengthColor[passwordStrength] : 'bg-gray-300'}`}></div>)}
                </div>
                <p className="text-xs text-gray-500">{strengthText[passwordStrength]} password</p>
              </div>
            )}
            <div className="relative mb-5">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input type={showConfirmPassword ? "text" : "password"} name="password2" placeholder="Confirm Password *" className="w-full pl-10 pr-10 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" value={formData.password2} onChange={handleChange} required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-400">
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="text-center text-gray-600 dark:text-gray-300 mt-4">
            Already have an account? <Link to="/login" className="text-purple-600 hover:underline">Login</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
export default Register;
