"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  Zap, 
  History,
  Activity,
  Layers,
  CheckCircle2
} from "lucide-react";
import { entityApi, EntityNode } from "$lib/v1/graph/entity";

const ReleaseRegistryPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const variantId = searchParams.get("variantId");

  const [releases, setReleases] = useState<EntityNode[]>([]);
  const [variants, setVariants] = useState<Record<string, string>>({}); // ID -> Name map
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allReleases, allVariants] = await Promise.all([
        entityApi.listByType('release'),
        entityApi.listByType('variant')
      ]);

      const variantMap: Record<string, string> = {};
      allVariants.forEach(v => {
        variantMap[v.id] = typeof v.name === 'object' ? (v.name?.en || v.slug) : (v.name || v.slug);
      });
      setVariants(variantMap);

      if (variantId) {
        setReleases(allReleases.filter(r => r.data?.parent_variant_id === variantId));
      } else {
        setReleases(allReleases);
      }
    } catch (err) {
      console.error("Failed to load releases:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [variantId]);

  const filteredReleases = releases.filter(release => {
    const nameStr = (typeof release.name === 'object' && release.name !== null)
      ? String((release.name as any).en || "")
      : String(release.name || "");
    
    return nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || release.slug.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex-1 flex flex-col items-center py-8 px-8 lg:px-12 min-h-screen">
      <div className="w-full max-w-7xl space-y-8">
        
        {/* Navigation Breadcrumb / Header */}
        <div className="flex items-center justify-between border-b border-white/[0.03] pb-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.back()}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {variantId ? variants[variantId] || "Loading..." : "Yearly"}{" "}
                <span className="text-slate-500 text-xl font-bold tracking-widest uppercase">Releases</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                {variantId ? `Timeline for technical variant: ${variants[variantId] || '...'}` : `Managing ${releases.length} yearly releases in registry`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text"
                placeholder="Search releases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/[0.03] border border-white/[0.05] rounded-2xl py-3 pl-10 pr-6 text-xs text-white focus:ring-1 focus:ring-white/20 transition-all w-64 hover:bg-white/[0.05]"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
            </div>
            <button 
              onClick={loadData}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Release Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white/[0.01] border border-white/[0.03] rounded-[2rem] h-64 animate-pulse" />
              ))
            ) : filteredReleases.length > 0 ? (
              filteredReleases.map((release, idx) => (
                <motion.div
                  key={release.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03 }}
                  whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.02)" }}
                  onClick={() => router.push(`/console/brands/model/variant/release/details?releaseId=${release.id}`)}
                  className="group cursor-pointer relative bg-white/[0.01] border border-white/[0.03] p-8 rounded-[2.5rem] transition-all hover:border-white/10 shadow-xl"
                >
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white font-black text-xl border border-white/5 group-hover:border-white/20 transition-all">
                        {typeof release.name === 'object' ? String((release.name as any)?.en || "?")[0] : String(release.name || "?")[0]}
                      </div>
                      <div className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-tighter text-slate-500">
                        {release.slug}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-white group-hover:text-slate-300 transition-colors leading-tight">
                        {typeof release.name === 'object' ? String((release.name as any)?.en || "Unnamed Release") : String(release.name || "Unnamed Release")}
                      </h3>
                      {!variantId && (
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          Variant: {variants[release.data?.parent_variant_id] || "Global"}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 text-slate-500 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{release.data?.emission_standard || "Euro 6"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                        <Activity className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{release.data?.manufacturing_status || "Active"}</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-600 group-hover:text-slate-400 transition-colors">
                        <History className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">
                          Facelift: {release.data?.is_facelift ? "YES" : "NO"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-500/80">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Verified</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <Search className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">No yearly releases discovered</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default ReleaseRegistryPage;
