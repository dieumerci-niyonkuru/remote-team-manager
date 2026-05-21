import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';

/**
 * MarkdownEditor - a reusable component wrapping @uiw/react-md-editor.
 * Props:
 *   value: string - current markdown content.
 *   onChange: (newValue: string) => void - callback when content changes.
 *   placeholder?: string - optional placeholder text.
 */
export default function MarkdownEditor({ value, onChange, placeholder = 'Write something awesome...' }) {
  const [content, setContent] = useState(value || '');

  // Keep internal state in sync when parent updates value
  useEffect(() => {
    setContent(value || '');
  }, [value]);

  const handleChange = (val) => {
    setContent(val);
    if (onChange) onChange(val);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-white/5 bg-[#0b1429]">
      <MDEditor
        height={400}
        value={content}
        onChange={handleChange}
        placeholder={placeholder}
        preview="edit"
        visibleDragbar={false}
        previewOptions={{ style: { backgroundColor: '#0b1429', color: '#e2e8f0' } }}
        textareaProps={{
          className: 'bg-[#0b1429] text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/40',
        }}
      />
    </div>
  );
}
