"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Power, ShieldCheck, Loader2, ArrowUpRight } from "lucide-react";
import { entityApi, EntityNode } from "$lib/v1/graph/entity";

interface BooleanEditorProps {
  attributeCode: string;
  name: string;
}

export const BooleanEditor = ({ attributeCode, name }: BooleanEditorProps) => {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<EntityNode[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  const loadVehicles = async () => {
    setIsLoadingVehicles(true);
    try {
      const allReleases = await entityApi.listByType('release');
      // Filter releases that have this attribute set to true in ANY data section
      const enabled = allReleases.filter(r => {
        const data = r.data || {};
        return Object.values(data).some((section: any) => 
          section && typeof section === 'object' && (section[attributeCode] === true || section[attributeCode] === "Yes" || section[attributeCode] === "true")
        );
      });
      setVehicles(enabled);
    } catch (err) {
      console.error("Failed to load connected vehicles:", err);
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, [attributeCode]);

  if (isLoadingVehicles && vehicles.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-slate-700 animate-spin" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scanning Graph for Connectivity...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 relative">


      {/* Active Deployments List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-t border-white/5 pt-10">
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Active Deployments
          </h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 rounded-full border border-emerald-500/10">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              {isLoadingVehicles ? "Syncing..." : `${vehicles.length} Enabled`}
            </span>
          </div>
        </div>

        {isLoadingVehicles ? (
          <div className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="w-6 h-6 text-slate-700 animate-spin" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scanning releases...</p>
          </div>
        ) : vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((v) => (
              <div 
                key={v.id}
                onClick={() => router.push(`/console/brands/model/variant/release/details?releaseId=${v.id}`)}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:bg-emerald-500/[0.03] hover:border-emerald-500/20 transition-all cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-[0.2em] truncate">
                    {v.slug}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/[0.01] border border-dashed border-white/5 rounded-[2.5rem] py-16 flex flex-col items-center gap-4">
            <ShieldCheck className="w-10 h-10 text-slate-800" />
            <div className="text-center space-y-1">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No active deployments</p>
              <p className="text-[9px] text-slate-700 font-medium">This feature is currently disabled across all releases.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
