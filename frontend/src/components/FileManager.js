import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-hot-toast';
import { FaTrash, FaDownload, FaUpload } from 'react-icons/fa';

const FileManager = ({ workspace }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    if (!workspace) return;
    setLoading(true);
    const res = await api.get(`/file-attachments/?workspace=${workspace.id}`);
    setFiles(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchFiles(); }, [workspace]);

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('content_type', 'workspace');
    formData.append('object_id', workspace.id);
    formData.append('file', file);
    await api.post('/file-attachments/', formData);
    toast.success('File uploaded');
    fetchFiles();
  };

  const deleteFile = async (id) => {
    if (window.confirm('Delete file?')) {
      await api.delete(`/file-attachments/${id}/`);
      toast.success('Deleted');
      fetchFiles();
    }
  };

  const downloadFile = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-4">File Manager</h2>
      {!workspace && <p>Select a workspace first.</p>}
      {workspace && (
        <>
          <label className="cursor-pointer bg-purple-600 text-white px-4 py-2 rounded inline-flex items-center gap-2 mb-4"><FaUpload /> Upload File<input type="file" className="hidden" onChange={uploadFile} /></label>
          {loading ? <p>Loading...</p> : (
            <ul className="space-y-2">
              {files.map(f => (
                <li key={f.id} className="flex justify-between items-center border-b py-2">
                  <span>{f.filename || f.file.split('/').pop()}</span>
                  <div className="flex gap-2">
                    <button onClick={() => downloadFile(f.file)} className="text-blue-500"><FaDownload /></button>
                    <button onClick={() => deleteFile(f.id)} className="text-red-500"><FaTrash /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};
export default FileManager;
