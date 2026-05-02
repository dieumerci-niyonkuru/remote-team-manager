import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaSearch, FaUserPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MemberSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length > 1) {
      setLoading(true);
      api.get(`/accounts/search/?q=${query}`)
        .then(res => setResults(res.data))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    } else {
      setResults([]);
    }
  }, [query]);

  const sendFriendRequest = async (userId) => {
    try {
      await api.post('/friends/request/', { to_user: userId });
      toast.success('Friend request sent');
    } catch (err) {
      toast.error('Request failed');
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center border rounded-lg px-3 py-1 bg-white dark:bg-gray-800">
        <FaSearch className="text-gray-400" />
        <input type="text" placeholder="Search members..." className="flex-1 p-2 outline-none bg-transparent" value={query} onChange={e => setQuery(e.target.value)} />
      </div>
      {results.length > 0 && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10">
          {results.map(user => (
            <div key={user.id} className="flex items-center justify-between p-3 border-b hover:bg-gray-100 dark:hover:bg-gray-700">
              <div>
                <div className="font-semibold">{user.username}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
              <button onClick={() => sendFriendRequest(user.id)} className="text-purple-600"><FaUserPlus /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MemberSearch;
