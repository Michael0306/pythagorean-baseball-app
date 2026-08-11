import React from 'react';

export default function BottomTabBar({ activeTab, onChangeTab }) {
  const tabs = [
    { id: 'KBO', label: 'KBO' },
    { id: 'MLB', label: 'MLB' },
    { id: 'NPB', label: 'NPB' },
  ];

  // SVG Baseball Icon
  const BaseballIcon = ({ active }) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? '#000000' : '#64748b'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M5.5 3.5a10 10 0 0 1 0 17" />
      <path d="M18.5 3.5a10 10 0 0 0 0 17" />
    </svg>
  );

  return (
    <nav className="bottom-tab-bar">
      {tabs.map((t) => {
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            className={`tab-item ${isActive ? 'active' : ''}`}
            onClick={() => onChangeTab(t.id)}
          >
            <div className="tab-icon">
              <BaseballIcon active={isActive} />
            </div>
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
