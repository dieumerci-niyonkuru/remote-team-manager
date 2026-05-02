import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ROLES = ['viewer', 'developer', 'manager', 'owner', 'frontend', 'backend', 'devops', 'designer', 'qa', 'product', 'hr'];

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    role: 'viewer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

    // Prepare exactly the same payload as the working curl
    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      password2: formData.password2,
      first_name: formData.first_name,
      last_name: formData.last_name,
      role: formData.role
    };

    try {
      const response = await fetch('https://remote-team-manager-production.up.railway.app/api/accounts/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        let errMsg = 'Registration failed. ';
        if (data && typeof data === 'object') {
          const firstError = Object.values(data).flat()[0];
          errMsg = firstError || errMsg;
        }
        throw new Error(errMsg);
      }
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-blue-600 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>
        <p className="text-center text-gray-500 mb-6">Join Remote Team Manager</p>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="Username *" className="w-full border rounded p-2 mb-3" value={formData.username} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email *" className="w-full border rounded p-2 mb-3" value={formData.email} onChange={handleChange} required />
          <input type="text" name="first_name" placeholder="First Name" className="w-full border rounded p-2 mb-3" value={formData.first_name} onChange={handleChange} />
          <input type="text" name="last_name" placeholder="Last Name" className="w-full border rounded p-2 mb-3" value={formData.last_name} onChange={handleChange} />
          <select name="role" className="w-full border rounded p-2 mb-3" value={formData.role} onChange={handleChange}>
            {ROLES.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
          </select>
          <input type="password" name="password" placeholder="Password * (min 6 chars)" className="w-full border rounded p-2 mb-3" value={formData.password} onChange={handleChange} required />
          <input type="password" name="password2" placeholder="Confirm Password *" className="w-full border rounded p-2 mb-4" value={formData.password2} onChange={handleChange} required />
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold py-2 rounded disabled:opacity-50">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">Already have an account? <Link to="/login" className="text-purple-600 hover:underline">Login</Link></p>
      </div>
    </div>
  );
};

export default Register;
