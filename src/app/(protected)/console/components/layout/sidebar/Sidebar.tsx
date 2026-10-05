"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Zap,
  User,
  Settings,
  LogOut,
  Loader2
} from "lucide-react";
import { CONSOLE_NAV_ITEMS } from "@lib/navigation";
import { getConsoleUserAction, consoleLogoutAction } from "@lib/auth";

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = CONSOLE_NAV_ITEMS;
  
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    getConsoleUserAction().then(res => {
      if (res && res.name) {
        setUser(res);
      } else {
        setUser({ name: "User", email: "" });
      }
    }).catch(() => {
      setUser({ name: "User", email: "" });
    });
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await consoleLogoutAction();
    router.push("/console-login");
    router.refresh();
  };

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
        <div className="bg-slate-50 rounded-3xl p-5 flex flex-col gap-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm text-slate-700 font-black text-xs uppercase">
              {user?.name ? user.name.substring(0, 2) : <User className="w-5 h-5 text-slate-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-900 truncate">
                {user?.name || "Loading..."}
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
          >
            {isLoggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
            {isLoggingOut ? "Logging Out..." : "Sign Out"}
          </button>
        </div>
      </div>
    </aside>
  );
};
