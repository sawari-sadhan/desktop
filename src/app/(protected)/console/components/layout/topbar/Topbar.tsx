"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  ChevronRight, 
  Bell,
  Search,
  ArrowLeft
} from "lucide-react";

const getPageInfo = (pathname: string) => {
  if (pathname.includes('/obd')) return { title: 'OBD-II Codes', subtitle: 'Diagnostic Trouble Code Registry' };
  if (pathname.includes('/brand')) return { title: 'Brand', subtitle: 'Managing manufacturers in Knowledge Graph' };
  if (pathname.includes('/attribute')) return { title: 'Technical Attributes', subtitle: 'Managing technical features in Knowledge Graph' };
  if (pathname.includes('/ingest')) return { title: 'Node Ingestion', subtitle: 'Add new nodes to the automotive knowledge graph' };
  if (pathname.includes('/access')) return { title: 'Access Control', subtitle: 'Security & Permissions Management' };
  if (pathname.includes('/highlights')) return { title: 'System Highlights', subtitle: 'Key Metrics and Insights' };
  return { title: 'System Overview', subtitle: 'Real-time Registry Intelligence' };
};

export const Topbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { title, subtitle } = getPageInfo(pathname);

  const segments = pathname.split('/').filter(Boolean);
  const isSubPage = segments.length > 2;
  const currentSlug = isSubPage ? segments[segments.length - 1] : null;

  let displayTitle = title;
  let breadcrumbTrail: string[] = [];
  
  if (isSubPage) {
    if (pathname.includes('/brand')) {
      const brandIdx = segments.indexOf('brand');
      const modelIdx = segments.indexOf('model');
      const variantIdx = segments.indexOf('variant');
      
      const brandSlug = (brandIdx !== -1 && brandIdx + 1 < segments.length) ? segments[brandIdx + 1] : null;
      const modelSlug = (modelIdx !== -1 && modelIdx + 1 < segments.length) ? segments[modelIdx + 1] : null;
      const variantSlug = (variantIdx !== -1 && variantIdx + 1 < segments.length) ? segments[variantIdx + 1] : null;
      const lastSeg = segments[segments.length - 1];
      
      let generatedTitle = "";
      
      if (brandSlug && brandSlug !== 'model') {
        breadcrumbTrail.push(brandSlug.replace(/-/g, ' '));
        generatedTitle = brandSlug.replace(/-/g, ' ');
      }
      if (modelSlug) {
        breadcrumbTrail.push(modelSlug.replace(/-/g, ' '));
        generatedTitle = generatedTitle ? `${generatedTitle} - ${modelSlug.replace(/-/g, ' ')}` : modelSlug.replace(/-/g, ' ');
      }
      if (variantSlug) {
        breadcrumbTrail.push(variantSlug.replace(/-/g, ' '));
        generatedTitle = `${generatedTitle} - ${variantSlug.replace(/-/g, ' ')}`;
      }
      
      if (lastSeg === 'specification' || lastSeg === 'media') {
        breadcrumbTrail.push(lastSeg);
      } else if (breadcrumbTrail.length === 0) {
        breadcrumbTrail.push(currentSlug?.replace(/-/g, ' ') || '');
        generatedTitle = currentSlug?.replace(/-/g, ' ') || title;
      }
      
      displayTitle = generatedTitle || currentSlug?.replace(/-/g, ' ') || title;
    } else {
      breadcrumbTrail.push(currentSlug?.replace(/-/g, ' ') || '');
      displayTitle = currentSlug?.replace(/-/g, ' ') || title;
    }
  }

  return (
    <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-10 relative z-30">
      <div className="flex items-center gap-6">
        {isSubPage && (
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] flex-wrap max-w-3xl">
            <span className={isSubPage ? "text-slate-400" : "text-slate-500"}>{isSubPage ? title : subtitle}</span>
            {breadcrumbTrail.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className={idx === breadcrumbTrail.length - 1 ? "text-slate-900" : "text-slate-400"}>{crumb}</span>
              </React.Fragment>
            ))}
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase truncate max-w-2xl">
            {isSubPage ? displayTitle : title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <input 
            type="text"
            placeholder="Search registry..."
            className="w-64 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 uppercase tracking-wider"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        </div>

        <div className="relative p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all">
          <Bell className="w-4 h-4 text-slate-600" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-white" />
        </div>
      </div>
    </header>
  );
};
