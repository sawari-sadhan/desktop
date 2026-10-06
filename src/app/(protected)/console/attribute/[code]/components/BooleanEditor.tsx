"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShieldCheck, Loader2, ArrowUpRight } from "lucide-react";
import { graphClient, EntityNode } from "@lib/core";

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
      // 1. Search for the "yes" node of this attribute code
      let searchRes = await graphClient.searchNodes({
        query: "yes",
        types: [attributeCode],
        limit: 10
      });

      let targetNode = searchRes.nodes?.find(n => {
        const val = n.metadata?.value || n.name?.en || n.slug;
        const valStr = val?.toString().toLowerCase();
        return valStr === "yes" || valStr === "true" || n.slug.endsWith("-yes") || n.slug.endsWith("-true");
      });

      // 2. Fallback: Search for "true" node
      if (!targetNode) {
        searchRes = await graphClient.searchNodes({
          query: "true",
          types: [attributeCode],
          limit: 10
        });
        targetNode = searchRes.nodes?.find(n => {
          const val = n.metadata?.value || n.name?.en || n.slug;
          const valStr = val?.toString().toLowerCase();
          return valStr === "yes" || valStr === "true" || n.slug.endsWith("-yes") || n.slug.endsWith("-true");
        });
      }

      // 3. Get all variants that link to this "yes/true" attribute node
      if (targetNode) {
        const neighborsRes = await graphClient.getNeighbors({
          nodeId: targetNode.id,
          linkTypes: ["has_attribute"]
        });

        const linked = await Promise.all((neighborsRes.nodes || []).map(async (n) => {
          let fullNode = n;
          // If metadata is sparse or missing parent_model_id, try fetching the full node
          if (!n.data?.parent_model_slug && !n.metadata?.parent_model_id) {
            try {
              const fullNodeRes = await graphClient.getNode({ id: n.id, slug: "" });
              if (fullNodeRes.node) fullNode = fullNodeRes.node;
            } catch (err) {}
          }
          
          let modelSlug = fullNode.data?.parent_model_slug;
          let brandSlug = fullNode.data?.parent_brand_slug;
          if (!modelSlug || !brandSlug) {
            const modelId = fullNode.data?.parent_model_id || fullNode.metadata?.parent_model_id;
            if (modelId) {
              try {
                const modelRes = await graphClient.getNode({ id: modelId as string, slug: "" });
                if (modelRes.node) {
                  modelSlug = modelRes.node.slug;
                  brandSlug = brandSlug || modelRes.node.data?.parent_brand_slug;
                  if (!brandSlug) {
                    const brandId = modelRes.node.data?.parent_brand_id || modelRes.node.metadata?.parent_brand_id;
                    if (brandId) {
                      const brandRes = await graphClient.getNode({ id: brandId as string, slug: "" });
                      if (brandRes.node) brandSlug = brandRes.node.slug;
                    }
                  }
                }
              } catch (err) {}
            }
          }
          return {
            id: n.id,
            type: n.type,
            slug: n.slug,
            name: n.name as any,
            description: n.description as any,
            tags: n.tags,
            metadata: fullNode.metadata as any,
            data: { ...(fullNode.data || {}), parent_model_slug: modelSlug || '_', parent_brand_slug: brandSlug || '' } as any
          };
        }));

        setVehicles(linked);
      } else {
        setVehicles([]);
      }
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
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scanning Graph for Connectivity...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 relative">

      {/* Active Deployments List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-t border-slate-200 pt-10">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Active Deployments
          </h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 rounded-full border border-emerald-500/10">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
              {isLoadingVehicles ? "Syncing..." : `${vehicles.length} Enabled`}
            </span>
          </div>
        </div>

        {isLoadingVehicles ? (
          <div className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scanning releases...</p>
          </div>
        ) : vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((v) => {
              const displayName = (typeof v.name === 'object' ? v.name?.en : v.name) || v.slug;
              return (
                <div 
                  key={v.id}
                  onClick={() => router.push(v.data?.parent_brand_slug ? `/console/brand/${v.data.parent_brand_slug}/model/${v.data?.parent_model_slug || '_'}/variant/${v.slug}` : `/console/brand/model/${v.data?.parent_model_slug || '_'}/variant/${v.slug}`)}
                  className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between group hover:bg-emerald-50 hover:border-emerald-200 transition-all cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-[0.2em] truncate">
                      {displayName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem] py-16 flex flex-col items-center gap-4">
            <ShieldCheck className="w-10 h-10 text-slate-300" />
            <div className="text-center space-y-1">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No active deployments</p>
              <p className="text-[9px] text-slate-500 font-medium">This feature is currently disabled across all releases.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
