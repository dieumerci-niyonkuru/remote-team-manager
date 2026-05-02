import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TypingSpeed = () => {
  const [text, setText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(w => w).length;
    const chars = text.length;
    setWordCount(words);
    setCharCount(chars);
    const readingTime = words / 200; // average 200 words per minute
    setMinutes(Math.max(0, readingTime));
    setPercent(Math.min(100, (words / 500) * 100)); // assuming 500 words is full progress
  }, [text]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h3 className="text-xl font-bold mb-3 dark:text-white">✍️ Writing Progress</h3>
      <textarea
        rows={6}
        className="w-full border rounded p-3 mb-4 dark:bg-gray-700 dark:border-gray-600"
        placeholder="Start typing your content here..."
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded"><p className="text-2xl font-bold">{wordCount}</p><p className="text-sm">Words</p></div>
        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded"><p className="text-2xl font-bold">{charCount}</p><p className="text-sm">Characters</p></div>
        <div className="p-3 bg-green-100 dark:bg-green-900 rounded"><p className="text-2xl font-bold">{minutes.toFixed(1)}</p><p className="text-sm">Min to read</p></div>
        <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded"><p className="text-2xl font-bold">{percent.toFixed(0)}%</p><p className="text-sm">Progress</p></div>
      </div>
      <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${percent}%` }}></div>
      </div>
      <p className="text-xs text-gray-500 mt-2">Based on 500 words target for full progress</p>
    </div>
  );
};
export default TypingSpeed;
