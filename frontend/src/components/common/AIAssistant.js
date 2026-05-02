import React, { useState } from 'react';
import { FaRobot, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

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
      setAnswer(`🤖 Hello ${user?.first_name || user?.username}! You asked: "${question}".\n\nHere's help:\n- To create a workspace, go to Workspaces → New Workspace.\n- To invite teammates, click the invite icon.\n- For 2FA, go to Profile → Enable 2FA.\n- Need more help? Contact support.`);
      setLoading(false);
    }, 1000);
    // Uncomment for real OpenAI:
    // try {
    //   const res = await api.post('/ai/chat/', { question });
    //   setAnswer(res.data.answer);
    // } catch(e) { setAnswer('Error, try again.'); }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
            <span className="font-bold">AI Assistant</span>
            <button onClick={() => setOpen(false)}><FaTimes /></button>
          </div>
          <div className="p-4 h-80 overflow-y-auto">
            {answer && <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-2">{answer}</div>}
          </div>
          <div className="p-4 border-t flex gap-2">
            <input
              type="text"
              placeholder="Ask me anything..."
              className="flex-1 border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && askAI()}
            />
            <button onClick={askAI} disabled={loading} className="bg-purple-600 text-white px-4 py-2 rounded-lg">Ask</button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg z-50 hover:bg-purple-700 transition transform hover:scale-105"
      >
        <FaRobot size={24} />
      </button>
    </>
  );
};
export default AIAssistant;
