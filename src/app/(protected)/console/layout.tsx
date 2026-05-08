"use client";

import React from "react";
import { Sidebar } from "./components/layout/sidebar/Sidebar";
import { Topbar } from "./components/layout/topbar/Topbar";

const ConsoleLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-[#0f1117] text-slate-400 font-sans overflow-hidden relative">
      {/* 🌌 Subtle celestial depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-400/[0.02] rounded-full blur-[120px]" />
      </div>

      <Sidebar />

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <Topbar />
        
        {/* Workspace Canvas - Midnight Slate */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-slate-900/40 m-4 rounded-[2.5rem] border border-white/[0.03] shadow-2xl backdrop-blur-sm">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ConsoleLayout;
