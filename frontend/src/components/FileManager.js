import React, { useState } from 'react';
import { FaFile, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const handleUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles.map(f => ({ name: f.name, size: f.size, id: Date.now() + Math.random() }))]);
    toast.success(`${newFiles.length} file(s) uploaded`);
  };
  const deleteFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
    toast.success('File deleted');
  };
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">File Manager</h2>
      <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded inline-block">Upload Files<input type="file" multiple className="hidden" onChange={handleUpload} /></label>
      <ul className="mt-4 space-y-2">
        {files.map(f => <li key={f.id} className="flex justify-between items-center border-b py-2"><div><FaFile className="inline mr-2" /> {f.name} ({(f.size / 1024).toFixed(2)} KB)</div><button onClick={() => deleteFile(f.id)} className="text-red-600"><FaTrash /></button></li>)}
      </ul>
    </div>
  );
};
export default FileManager;
