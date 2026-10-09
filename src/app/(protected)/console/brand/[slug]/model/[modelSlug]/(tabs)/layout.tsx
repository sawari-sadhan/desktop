import React from 'react';

export default function ModelTabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
