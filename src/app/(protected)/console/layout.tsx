"use client";

import React from "react";
import { Sidebar } from "./components/layout/sidebar/Sidebar";
import { Topbar } from "./components/layout/topbar/Topbar";

const ConsoleLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-600 font-sans overflow-hidden relative">
      {/* Subtle depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/[0.05] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-400/[0.05] rounded-full blur-[120px]" />
      </div>

      <Sidebar />

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <Topbar />
        
        {/* Workspace Canvas */}
        <div className="flex-1 relative bg-white rounded-none flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConsoleLayout;
