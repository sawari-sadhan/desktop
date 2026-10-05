"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  ChevronLeft, 
  Search,
  RefreshCw,
  Image as ImageIcon
} from "lucide-react";
import { ModelProvider, useModelContext } from "./specification/components/ModelContext";

const ModelLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { model, brand, isLoading, loadData, slug } = useModelContext();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <RefreshCw className="w-12 h-12 text-slate-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Decrypting Model Spec Graph</p>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-slate-50">
        <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">Model Discovery Failed</p>
      </div>
    );
  }

  const modelName = typeof model.name === 'object' ? (model.name as any).en : model.name;
  const brandName = brand ? (typeof brand.name === 'object' ? (brand.name as any).en : brand.name) : "Global";

  // Check which tab is active based on URL
  const isMediaActive = pathname.endsWith('/media');
  const isSpecsActive = pathname.endsWith('/specification') || (!isMediaActive && !pathname.endsWith('/variant'));

  return (
    <div className="flex-1 p-12 min-h-screen">
      <div className="w-full space-y-12">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-12">
          <div className="space-y-6">
            <button 
              onClick={() => brand ? router.push(`/console/brand/${brand.slug}`) : router.push('/console/brand/model')}
              className="flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Return to Models</span>
            </button>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-blue-600 font-black text-sm uppercase tracking-[0.3em]">{brandName}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                <span className="text-slate-500 text-xs font-bold font-mono">{model.slug}</span>
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
                {modelName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={loadData}
              className="p-4 bg-white border border-slate-200 shadow-sm rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Sync</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 border-b border-slate-200 pb-px">
          <button
            onClick={() => router.push(`/console/brand/model/${slug}/specification`)}
            className={`px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${
              isSpecsActive
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => router.push(`/console/brand/model/${slug}/media`)}
            className={`px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 ${
              isMediaActive
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Media & Assets
          </button>
        </div>

        {/* Dynamic Content */}
        {children}

      </div>
    </div>
  );
};

export default function ModelLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModelProvider>
      <ModelLayoutContent>
        {children}
      </ModelLayoutContent>
    </ModelProvider>
  );
}
