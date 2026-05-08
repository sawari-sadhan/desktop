"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { 
  ChevronRight, 
  Bell, 
  User 
} from "lucide-react";

export const Topbar = () => {
  const pathname = usePathname();

  return (
    <header className="h-24 flex items-center justify-between px-12 relative z-30">
      {/* Breadcrumbs / Path Info */}
      <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em]">
        <span className="text-slate-500">Registry Control</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
        <span className="text-slate-100 bg-white/10 px-4 py-2 rounded-xl border border-white/5 shadow-sm">
          {pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
        </span>
      </div>

      {/* Simplified Actions */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] cursor-pointer transition-all">
          <Bell className="w-5 h-5 text-slate-300" />
          <span className="absolute top-3.5 right-3.5 w-1.5 h-1.5 bg-slate-400 rounded-full border border-slate-900" />
        </div>

        <div className="w-[1px] h-8 bg-white/[0.05]" />

        {/* Quick User Context */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
            <User className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-[10px] font-black text-slate-100 uppercase tracking-widest">Admin</span>
        </div>
      </div>
    </header>
  );
};
