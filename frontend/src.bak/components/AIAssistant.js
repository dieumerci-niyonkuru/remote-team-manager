import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const askAI = async () => {
    if (!question.trim()) return;
    setLoading(true);
    // Mock response – replace with OpenAI API call
    setTimeout(() => {
      setAnswer(`AI: I'm here to help, ${user?.first_name || user?.username}! You asked: "${question}". In production, this connects to OpenAI.`);
      setLoading(false);
    }, 1000);
    // Uncomment for real OpenAI:
    // try {
    //   const res = await axios.post('/api/ai/chat/', { question });
    //   setAnswer(res.data.answer);
    // } catch(e) { setAnswer('Error. Try again.'); }
  };

  return (
    <>
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setOpen(!open)} className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg z-50"><FaRobot size={24} /></motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="bg-purple-600 text-white p-3 flex justify-between items-center"><span className="font-bold">AI Assistant</span><button onClick={() => setOpen(false)}><FaTimes /></button></div>
            <div className="p-4 h-80 overflow-y-auto">{answer && <div className="bg-gray-100 p-2 rounded mb-2">{answer}</div>}</div>
            <div className="p-4 border-t flex gap-2"><input type="text" placeholder="Ask me anything..." className="flex-1 border rounded px-3 py-2" value={question} onChange={e=>setQuestion(e.target.value)} onKeyPress={e=>e.key==='Enter'&&askAI()} /><button onClick={askAI} disabled={loading} className="bg-purple-600 text-white px-4 py-2 rounded">Ask</button></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default AIAssistant;
