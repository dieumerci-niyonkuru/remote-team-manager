import React from 'react';
import { Button } from '../common/Button';
import { BookOpen } from 'lucide-react';

/**
 * Simple tree view for wiki articles. Currently displays a flat list; can be expanded
 * to hierarchical structure based on article.parent_id if needed.
 */
export default function WikiTree({ articles, selectedId, onSelect }) {
  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No articles found.
      </div>
    );
  }

  return (
    <ul className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
      {articles.map((a) => (
        <li key={a.id}>
          <Button
            variant="ghost"
            className={`w-full justify-start text-left px-4 py-2 rounded-lg transition-colors ${selectedId === a.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800/50'}`}
            leftIcon={<BookOpen size={16} className="mr-2" />}
            onClick={() => onSelect(a)}
          >
            {a.title}
          </Button>
        </li>
      ))}
    </ul>
  );
}
