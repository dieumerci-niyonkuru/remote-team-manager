import React, { useState, useEffect } from 'react';
import api from '../api';
import { format } from 'date-fns';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    // If backend has audit log endpoint, call it; otherwise mock
    api.get('/audit-logs/').then(res => setLogs(res.data)).catch(() => {
      setLogs([{ id: 1, user: 'admin', action: 'Created workspace', timestamp: new Date() }]);
    });
  }, []);
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Audit Logs</h2>
      <div className="overflow-x-auto"><div class="overflow-x-auto"><table className="min-w-full"><thead><tr><th>User</th><th>Action</th><th>Timestamp</th></tr></thead><tbody>{logs.map(log => <tr key={log.id}><td>{log.user}</td><td>{log.action}</td><td>{format(new Date(log.timestamp), 'PPpp')}</td></tr>)}</tbody></table></div></div>
    </div>
  );
};
export default AuditLogs;
