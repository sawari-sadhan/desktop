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
        


        {/* Tab Navigation & Actions */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-px">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(brand ? `/console/brand/${brand.slug}/model/${slug}/specification` : `/console/brand/model/${slug}/specification`)}
              className={`px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${
                isSpecsActive
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => router.push(brand ? `/console/brand/${brand.slug}/model/${slug}/media` : `/console/brand/model/${slug}/media`)}
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

          <button 
            onClick={loadData}
            className="mb-2 p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider hidden md:inline">Sync Data</span>
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
