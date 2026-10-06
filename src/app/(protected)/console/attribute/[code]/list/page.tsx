"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Car, 
  Search, 
  Loader2, 
  Tag,
  ArrowUpRight,
  CheckCircle2
} from "lucide-react";
import { graphClient, NodeType, EntityNode } from "@lib/core";

const AttributeLinkedVehiclesPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const attributeCode = params.code as string;
  const targetValue = searchParams.get("value");

  const [attribute, setAttribute] = useState<NodeType | null>(null);
  const [vehicles, setVehicles] = useState<EntityNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Attribute Details
      const attrData = await graphClient.getNodeType({ code: attributeCode });
      setAttribute(attrData.nodeType || null);

      // 2. Search for the attribute value node in the graph
      const searchRes = await graphClient.searchNodes({
        query: targetValue || "",
        types: [attributeCode],
        limit: 20
      });

      if (searchRes.nodes && searchRes.nodes.length > 0) {
        // Find the node that matches the value exactly
        const targetNode = searchRes.nodes.find(n => {
          const val = n.metadata?.value || n.name?.en || n.slug;
          return val?.toString().toLowerCase() === targetValue?.toLowerCase();
        }) || searchRes.nodes[0];

        // 3. Fetch its neighbors (which are the variants)
        const neighborsRes = await graphClient.getNeighbors({
          nodeId: targetNode.id,
          linkTypes: ["has_attribute"]
        });

        // Cast nodes to EntityNode for consistent rendering and fetch missing model/brand slugs
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
      console.error("Failed to load linked vehicles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [attributeCode, targetValue]);

  const filteredVehicles = vehicles.filter(v => {
    const name = (typeof v.name === 'object' ? v.name?.en : v.name) || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || v.slug.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-12 h-12 text-slate-700 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Querying Graph Relations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-12 min-h-screen">
      <div className="w-full space-y-10">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Attribute</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500">
              Filtered Connectivity
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative bg-white/[0.02] border border-white/[0.05] rounded-[3rem] p-12 overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/[0.02] rounded-full blur-[100px]" />
          
          <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-3xl font-black uppercase shadow-2xl">
              {attribute?.code.slice(0, 2) || "AT"}
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                  {attribute?.name || attributeCode.replace(/_/g, " ")}
                </h1>
                <div className="flex items-center gap-3 mt-6">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <Tag className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] font-mono text-slate-300 uppercase">{attributeCode}</span>
                  </div>
                  <div className="text-slate-700 font-bold">/</div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{targetValue}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium max-w-xl pt-2">
                Showing all graph entities where <span className="text-white">"{attribute?.name}"</span> is explicitly set to <span className="text-white">"{targetValue}"</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Management Container */}
        <div className="bg-white/[0.01] border border-white/[0.03] rounded-[3rem] p-10 shadow-2xl space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Car className="w-4 h-4 text-emerald-500" />
              Active Deployments
            </h2>
            
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <input 
                  type="text"
                  placeholder="Filter vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white focus:ring-1 focus:ring-white/20 transition-all hover:bg-white/[0.05]"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
              </div>
              <div className="px-4 py-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  {vehicles.length} Connected
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle, idx) => {
                  const displayName = (typeof vehicle.name === 'object' ? vehicle.name?.en : vehicle.name) || vehicle.slug;
                  return (
                    <motion.div
                      key={vehicle.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => router.push(vehicle.data?.parent_brand_slug ? `/console/brand/${vehicle.data.parent_brand_slug}/model/${vehicle.data?.parent_model_slug || '_'}/variant/${vehicle.slug}` : `/console/brand/model/${vehicle.data?.parent_model_slug || '_'}/variant/${vehicle.slug}`)}
                      className="group bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex items-center justify-between hover:bg-emerald-500/[0.03] hover:border-emerald-500/20 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-widest truncate">
                          {displayName}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center gap-4">
                  <Car className="w-10 h-10 text-slate-800" />
                  <div className="text-center space-y-1">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No active deployments</p>
                    <p className="text-[9px] text-slate-700 font-medium tracking-tight">No vehicles found with this specific value.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const AttributeLinkedVehiclesPageWithSuspense = () => (
  <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-screen text-slate-400">Loading Linked Vehicles...</div>}>
    <AttributeLinkedVehiclesPage />
  </Suspense>
);

export default AttributeLinkedVehiclesPageWithSuspense;
