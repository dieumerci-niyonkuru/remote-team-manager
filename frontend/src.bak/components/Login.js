import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [error, setError] = useState('');
  const [requireOtp, setRequireOtp] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // If we already tried and got 2FA required, send with OTP
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
            setError('Invalid credentials');
          }
        }
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-blue-600">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-center text-gray-500 mb-6">Sign in to your account</p>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" className="w-full border rounded p-2 mb-4" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="password" placeholder="Password" className="w-full border rounded p-2 mb-4" value={password} onChange={e => setPassword(e.target.value)} required />
          {requireOtp && (
            <input type="text" placeholder="6-digit OTP" className="w-full border rounded p-2 mb-4" value={otpToken} onChange={e => setOtpToken(e.target.value)} required />
          )}
          <button type="submit" className="w-full bg-purple-600 text-white font-semibold py-2 rounded">Login</button>
        </form>
        <p className="text-center text-gray-600 mt-4">Don't have an account? <Link to="/register" className="text-purple-600 hover:underline">Register</Link></p>
      </div>
    </div>
  );
};
export default Login;
