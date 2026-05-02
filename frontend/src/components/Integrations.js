import React from 'react';
import { FaGithub, FaGoogleDrive, FaVideo } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Integrations = () => {
  const connect = (name) => toast.success(`${name} integration coming soon!`);
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Integrations</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => connect('GitHub')} className="flex items-center gap-2 p-4 border rounded hover:shadow"><FaGithub /> GitHub</button>
        <button onClick={() => connect('Google Drive')} className="flex items-center gap-2 p-4 border rounded hover:shadow"><FaGoogleDrive /> Google Drive</button>
        <button onClick={() => connect('Zoom')} className="flex items-center gap-2 p-4 border rounded hover:shadow"><FaVideo /> Zoom</button>
      </div>
    </div>
  );
};
export default Integrations;
