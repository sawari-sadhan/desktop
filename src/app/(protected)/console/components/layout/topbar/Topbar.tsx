"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { 
  ChevronRight, 
  Bell, 
  LogOut 
} from "lucide-react";
import { consoleLogoutAction as logoutAction } from "@lib/auth";

export const Topbar = () => {
  const pathname = usePathname();

  return (
    <header className="h-24 flex items-center justify-between px-12 relative z-30">
      {/* Breadcrumbs / Path Info */}
      <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em]">
        <span className="text-slate-400">Registry Control</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          {pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
        </span>
      </div>

      {/* Simplified Actions */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 cursor-pointer transition-all">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-3.5 right-3.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-white" />
        </div>

        <div className="w-[1px] h-8 bg-slate-200" />

        {/* Logout Action */}
        <button 
          onClick={async () => {
            await logoutAction();
            window.location.href = "/console-login";
          }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/10 group-hover:bg-rose-500 group-hover:text-white transition-all">
            <LogOut className="w-4 h-4 text-rose-400 group-hover:text-white transition-colors" />
          </div>
          <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest group-hover:text-rose-300 transition-colors">Logout</span>
        </button>
      </div>
    </header>
  );
};
