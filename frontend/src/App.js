import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AIAssistant from './components/common/AIAssistant';
import ScrollButtons from './components/common/ScrollButtons';
import Landing from './components/Landing';
import FeaturesAll from './pages/FeaturesAll';
import TaskManagement from './pages/TaskManagement';
import RealTimeChat from './pages/RealTimeChat';
import Analytics from './pages/Analytics';
import AIAssistantPage from './pages/AIAssistant';
import FileStorage from './pages/FileStorage';
import PricingAll from './pages/PricingAll';
import PricingFree from './pages/PricingFree';
import PricingPro from './pages/PricingPro';
import PricingEnterprise from './pages/PricingEnterprise';
import Resources from './pages/Resources';
import Contact from './pages/Contact';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { Toaster } from 'react-hot-toast';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppContent() {
  const location = useLocation();
  const hideHeader = location.pathname.startsWith('/dashboard');
  const [isAIOpen, setAIOpen] = useState(false);
  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeader && <Header onOpenAI={() => setAIOpen(true)} />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/features" element={<FeaturesAll />} />
          <Route path="/task-management" element={<TaskManagement />} />
          <Route path="/real-time-chat" element={<RealTimeChat />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/file-storage" element={<FileStorage />} />
          <Route path="/pricing" element={<PricingAll />} />
          <Route path="/pricing/free" element={<PricingFree />} />
          <Route path="/pricing/pro" element={<PricingPro />} />
          <Route path="/pricing/enterprise" element={<PricingEnterprise />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        </Routes>
      </main>
      <Footer />
      <AIAssistant />
      <ScrollButtons />
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}
export default App;
