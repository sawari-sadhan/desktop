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
import { CONSOLE_NAV_ITEMS } from "@lib/navigation";

export const Sidebar = () => {
  const pathname = usePathname();
  const navItems = CONSOLE_NAV_ITEMS;

  return (
    <aside className="w-72 bg-white z-20 flex flex-col relative border-r border-slate-200 shadow-sm">
      {/* Brand Logo */}
      <div className="p-10 flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-slate-900 text-base font-black tracking-tight block">SAWARI</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] -mt-1 block">Console</span>
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
                  ? "bg-slate-100 text-slate-900 border border-slate-200 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <item.icon className={`w-4 h-4 transition-colors ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
              {item.name}
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute left-[-24px] w-1.5 h-6 bg-blue-600 rounded-r-full" 
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile / Status */}
      <div className="p-6 border-t border-slate-200">
        <div className="bg-slate-50 rounded-3xl p-5 flex items-center gap-4 border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200">
            <User className="w-5 h-5 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-slate-900 truncate">Administrator</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Sync Active
            </p>
          </div>
          <Settings className="w-4 h-4 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors" />
        </div>
      </div>
    </aside>
  );
};
