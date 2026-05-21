import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { wiki } from '../../services/api';
import toast from 'react-hot-toast';

/**
 * VersionModal - shows list of revisions for a wiki article and allows restore.
 * Props:
 *   articleId: number - the wiki article ID.
 *   isOpen: boolean - modal visibility.
 *   onClose: () => void - close handler.
 */
export default function VersionModal({ articleId, isOpen, onClose }) {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && articleId) {
      setLoading(true);
      wiki.revisions(articleId)
        .then(res => setRevisions(res.data.data || res.data))
        .catch(() => toast.error('Failed to load revisions'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, articleId]);

  const handleRestore = (revId) => {
    wiki.restore(articleId, revId)
      .then(() => {
        toast.success('Revision restored');
        onClose();
      })
      .catch(() => toast.error('Restore failed'));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Version History">
      {loading ? (
        <div className="text-center py-4 text-gray-400">Loading…</div>
      ) : (
        <ul className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
          {revisions.map(rev => (
            <li key={rev.id} className="flex justify-between items-center p-2 bg-[#0b1429] rounded-lg border border-white/5">
              <div className="text-sm text-gray-300">
                {new Date(rev.created_at).toLocaleString()}
                <span className="ml-2 text-xs text-gray-500">by {rev.author_name || rev.author}</span>
              </div>
              <button
                onClick={() => handleRestore(rev.id)}
                className="px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700 transition"
              >
                Restore
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
