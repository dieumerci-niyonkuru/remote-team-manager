import React, { useState, useEffect, useRef } from 'react';

const TimedTyping = () => {
  const [text, setText] = useState('');
  const [timeMinutes, setTimeMinutes] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(intervalRef.current);
      setIsActive(false);
      alert(`Time is up! You wrote ${wordCount} words.`);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft]);

  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(w => w).length;
    setWordCount(words);
  }, [text]);

  const startTimer = () => {
    if (timeMinutes > 0) {
      setTimeLeft(timeMinutes * 60);
      setIsActive(true);
    }
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setTimeLeft(0);
    setText('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h3 className="text-xl font-bold mb-3">⏱️ Timed Typing Challenge</h3>
      <div className="flex gap-3 items-center mb-4">
        <input type="number" min="1" value={timeMinutes} onChange={e => setTimeMinutes(e.target.value)} className="border rounded p-2 w-24" disabled={isActive} />
        <span>minutes</span>
        <button onClick={startTimer} disabled={isActive} className="bg-green-600 text-white px-3 py-1 rounded">Start</button>
        <button onClick={resetTimer} className="bg-red-600 text-white px-3 py-1 rounded">Reset</button>
      </div>
      {isActive && <div className="text-lg font-bold mb-2">Time left: {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</div>}
      <textarea rows="8" className="w-full border rounded p-3 dark:bg-gray-700" placeholder="Start typing here..." value={text} onChange={e => setText(e.target.value)} disabled={!isActive} />
      <div className="mt-2 flex justify-between">
        <span>Words: {wordCount}</span>
        <span>Characters: {text.length}</span>
      </div>
    </div>
  );
};
export default TimedTyping;
