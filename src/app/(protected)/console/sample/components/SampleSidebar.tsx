"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Palette, 
  LayoutDashboard, 
  ListFilter, 
  FileText, 
  Layers, 
  Maximize2,
  Sparkles,
  ArrowLeft,
  GitPullRequest,
  Settings
} from "lucide-react";

export const SampleSidebar = () => {
  const pathname = usePathname();

  const sampleNavItems = [
    { name: "Tokens & System", href: "/console/sample", icon: Palette },
    { name: "Dashboard", href: "/console/sample/dashboard", icon: LayoutDashboard },
    { name: "List / Records", href: "/console/sample/list", icon: ListFilter },
    { name: "Form / Input", href: "/console/sample/form", icon: FileText },
    { name: "Detail View", href: "/console/sample/detail", icon: Layers },
    { name: "Modals & Dialogs", href: "/console/sample/modal", icon: Maximize2 },
    { name: "Pipeline & Board", href: "/console/sample/pipeline", icon: GitPullRequest },
    { name: "Settings & Config", href: "/console/sample/settings", icon: Settings },
  ];

  return (
    <aside className="w-72 bg-white z-20 flex flex-col relative border-r border-slate-200 shrink-0">
      {/* Brand Logo Header */}
      <div className="p-10 flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-slate-900 text-xl font-bold tracking-tight block">STYLE</span>
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider -mt-0.5 block">Samples</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-6 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        {sampleNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-5 py-4 rounded-3xl text-sm font-semibold uppercase tracking-wider transition-all duration-300 group relative ${
                isActive 
                  ? "bg-slate-50 text-slate-900 border border-slate-200" 
                  : "text-slate-500 bg-transparent border border-transparent hover:bg-slate-50 hover:border-slate-200"
              }`}
            >
              <item.icon className={`w-4 h-4 transition-colors ${isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Card - Return to Main Console */}
      <div className="p-6 border-t border-slate-200">
        <div className="bg-slate-50 rounded-3xl p-5 flex flex-col gap-4 border border-slate-200">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Pattern Library
            </span>
          </div>
          
          <Link
            href="/console"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors text-sm font-semibold uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Console</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};
