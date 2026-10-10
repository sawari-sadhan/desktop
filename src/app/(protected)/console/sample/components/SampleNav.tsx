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
  GitPullRequest,
  Settings
} from "lucide-react";

export function SampleNav() {
  const pathname = usePathname();

  const links = [
    { href: "/console/sample", label: "UI System & Tokens", icon: Palette },
    { href: "/console/sample/dashboard", label: "Dashboard / Metrics", icon: LayoutDashboard },
    { href: "/console/sample/list", label: "List / Data Table", icon: ListFilter },
    { href: "/console/sample/form", label: "Form / Add Resource", icon: FileText },
    { href: "/console/sample/detail", label: "Entity / Detail View", icon: Layers },
    { href: "/console/sample/modal", label: "Modals & Dialogs", icon: Maximize2 },
    { href: "/console/sample/pipeline", label: "Pipeline & Board", icon: GitPullRequest },
    { href: "/console/sample/settings", label: "Workspace Settings", icon: Settings },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-2 flex items-center justify-between flex-wrap gap-2 mb-8">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-3 py-1">
          Sample Reference:
        </span>
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="hidden lg:flex items-center gap-2 pr-3">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Live Design Standards
        </span>
      </div>
    </div>
  );
}
