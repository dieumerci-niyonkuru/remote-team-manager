import React, { useState, useRef, useEffect } from 'react';
import api from '../../api';

const MentionInput = ({ value, onChange, placeholder, className }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [cursorPos, setCursorPos] = useState(0);
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    const pos = e.target.selectionStart;
    setCursorPos(pos);
    const before = newValue.slice(0, pos);
    const atIndex = before.lastIndexOf('@');
    if (atIndex !== -1 && (atIndex === 0 || before[atIndex-1] === ' ')) {
      const query = before.slice(atIndex+1);
      if (query.length > 0) {
        api.get('/users/?search=' + query).then(res => setSuggestions(res.data));
      } else {
        api.get('/users/').then(res => setSuggestions(res.data));
      }
    } else {
      setSuggestions([]);
    }
  };

  const insertMention = (username) => {
    const before = value.slice(0, cursorPos);
    const after = value.slice(cursorPos);
    const lastAt = before.lastIndexOf('@');
    const newValue = before.slice(0, lastAt) + `@${username} ` + after;
    onChange(newValue);
    setSuggestions([]);
    setTimeout(() => textareaRef.current?.focus(), 10);
  };

  return (
    <div className="relative">
      <textarea ref={textareaRef} value={value} onChange={handleChange} placeholder={placeholder} className={className} rows={2} />
      {suggestions.length > 0 && (
        <div className="absolute bg-white border shadow rounded z-10 w-full mt-1">
          {suggestions.map(u => <div key={u.id} onClick={() => insertMention(u.username)} className="p-2 hover:bg-gray-100 cursor-pointer">@{u.username}</div>)}
        </div>
      )}
    </div>
  );
};
export default MentionInput;
