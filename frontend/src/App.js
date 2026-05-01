import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import InviteAccept from './components/InviteAccept';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import AIAssistant from './components/AIAssistant';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/invite/:token" element={<InviteAccept />} />
          <Route path="/dashboard/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        </Routes>
        <AIAssistant />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
