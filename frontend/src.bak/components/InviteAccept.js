import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';

const InviteAccept = () => {
  const { token } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accept = async () => {
      if (!isAuthenticated) {
        localStorage.setItem('redirectAfterLogin', `/invite/${token}`);
        navigate('/login');
        return;
      }
      try {
        await api.post('/workspaces/accept_invite/', { token });
        toast.success('You have joined the workspace!');
        navigate('/dashboard');
      } catch (err) {
        toast.error('Invalid or expired invite');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    accept();
  }, [token, isAuthenticated, navigate]);

  return <div className="flex items-center justify-center h-screen">Loading...</div>;
};
export default InviteAccept;
