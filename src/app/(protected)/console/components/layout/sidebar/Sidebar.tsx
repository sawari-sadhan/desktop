"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Zap,
  User,
  Settings
} from "lucide-react";
import { CONSOLE_NAV_ITEMS } from "$lib/navigation";

export const Sidebar = () => {
  const pathname = usePathname();
  const navItems = CONSOLE_NAV_ITEMS;

  return (
    <aside className="w-72 bg-slate-950/40 backdrop-blur-3xl z-20 flex flex-col relative border-r border-white/[0.02]">
      {/* Brand Logo */}
      <div className="p-10 flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <Zap className="w-5 h-5 text-slate-950 fill-slate-950/10" />
        </div>
        <div>
          <span className="text-slate-100 text-base font-black tracking-tight block">SAWARI</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] -mt-1 block">Console</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-6 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 group relative ${
                isActive 
                  ? "bg-white/5 text-slate-100 border border-white/5 shadow-inner" 
                  : "text-slate-400 hover:bg-white/[0.02] hover:text-slate-200"
              }`}
            >
              <item.icon className={`w-4 h-4 transition-colors ${isActive ? "text-slate-100" : "text-slate-500 group-hover:text-slate-300"}`} />
              {item.name}
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute left-[-24px] w-1.5 h-6 bg-slate-400 rounded-r-full" 
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile / Status */}
      <div className="p-6 border-t border-white/[0.02]">
        <div className="bg-white/[0.02] rounded-3xl p-5 flex items-center gap-4 border border-white/[0.03]">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
            <User className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-slate-100 truncate">Administrator</p>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              Sync Active
            </p>
          </div>
          <Settings className="w-4 h-4 text-slate-400 hover:text-slate-100 cursor-pointer transition-colors" />
        </div>
      </div>
    </aside>
  );
};
