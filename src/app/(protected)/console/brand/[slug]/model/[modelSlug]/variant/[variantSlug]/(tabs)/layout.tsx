"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Settings, Image as ImageIcon, MapPin } from 'lucide-react';

export default function VariantTabsLayout({ 
  children
}: { 
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const params = useParams();
  const basePath = `/console/brand/${params.slug}/model/${params.modelSlug}/variant/${params.variantSlug}`;
  
  const tabs = [
    { name: "Availability", href: `${basePath}/availability`, icon: MapPin },
    { name: "Specifications", href: `${basePath}/specification`, icon: Settings },
    { name: "Media", href: `${basePath}/media`, icon: ImageIcon },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)] bg-slate-50/50 relative">
      <div className="bg-white border-b border-slate-200 px-12 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        {tabs.map(tab => {
          // If the pathname exactly equals the basePath, we assume Availability is active, or we let the redirect handle it.
          const isActive = pathname === tab.href || (pathname === basePath && tab.name === "Availability");
          return (
            <Link 
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                isActive 
                  ? "bg-slate-900 text-white shadow-md ring-2 ring-slate-900/20 ring-offset-2" 
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </Link>
          );
        })}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
