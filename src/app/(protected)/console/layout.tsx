"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./components/layout/sidebar/Sidebar";
import { SampleSidebar } from "./sample/components/SampleSidebar";
import { Topbar } from "./components/layout/topbar/Topbar";
import { TopbarProvider } from "./components/layout/topbar/TopbarActions";

const ConsoleLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isSamplePage = pathname?.startsWith("/console/sample");

  return (
    <TopbarProvider>
      <div className="console-shell flex h-screen bg-slate-50 text-slate-600 font-sans overflow-hidden relative">
        {/* Subtle depth */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/[0.05] rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-400/[0.05] rounded-full blur-[120px]" />
        </div>

        {isSamplePage ? <SampleSidebar /> : <Sidebar />}

        <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
          <Suspense fallback={<header className="h-20 bg-white border-b border-slate-200" />}>
            <Topbar />
          </Suspense>
          
          {/* Workspace Canvas */}
          <div className="flex-1 relative bg-slate-50/40 rounded-none flex flex-col overflow-hidden">
            {/* Subtle depth */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/[0.05] rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-400/[0.05] rounded-full blur-[120px]" />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
              {children}
            </div>
          </div>
        </main>
      </div>
    </TopbarProvider>
  );
};

export default ConsoleLayout;