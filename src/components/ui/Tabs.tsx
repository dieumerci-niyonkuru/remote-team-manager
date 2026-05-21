import React, { useState } from 'react';

type Tab = { id: string; title: string; content: React.ReactNode };

interface TabsProps {
  tabs: Tab[];
  defaultActiveId?: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultActiveId, className = '' }) => {
  const [activeId, setActiveId] = useState(defaultActiveId || (tabs[0] && tabs[0].id));

  const activeTab = tabs.find((t) => t.id === activeId);

  return (
    <div className={className}>
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveId(tab.id)}
            className={`px-4 py-2 -mb-px text-sm font-medium focus:outline-none ${
              tab.id === activeId
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div className="mt-4">{activeTab && activeTab.content}</div>
    </div>
  );
};

export default Tabs;
