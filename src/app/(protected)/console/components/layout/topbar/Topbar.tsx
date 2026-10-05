"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { 
  ChevronRight, 
  Bell
} from "lucide-react";

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

      </div>
    </header>
  );
};
