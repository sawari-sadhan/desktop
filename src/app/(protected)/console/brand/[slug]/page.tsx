"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Layers, 
  ArrowRight, 
  Car, 
  Bike,
  X,
  Edit2,
  Box,
  Calendar,
  Sparkles
} from "lucide-react";
import { graphClient, EntityNode } from "@lib/core";
import { PageLayout, PageContent, TopbarActions } from "../../components";
import { theme } from "../../theme";

type FilterCategory = "all" | "4w" | "2w";

const BrandModelsPage = () => {
  const router = useRouter();
  const params = useParams();
  const brandSlug = (params.slug as string) || "";

  const [brand, setBrand] = useState<EntityNode | null>(null);
  const [models, setModels] = useState<EntityNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  const loadData = async () => {
    if (!brandSlug) return;
    setIsLoading(true);
    try {
      // 1. Fetch Brand by Slug
      const brandRes = await graphClient.getNode({ id: "", slug: brandSlug });
      if (!brandRes.node) throw new Error("Brand not found");

      const mappedBrand: EntityNode = {
        id: brandRes.node.id,
        type: brandRes.node.type,
        slug: brandRes.node.slug,
        name: brandRes.node.name || {},
        description: brandRes.node.description || {},
        tags: brandRes.node.tags || [],
        metadata: brandRes.node.metadata || {},
        data: brandRes.node.data || {},
        created_at: "",
        updated_at: brandRes.node.updatedAt
      };
      setBrand(mappedBrand);

      // 2. Fetch Models for this Brand
      const neighborsResponse = await graphClient.getNeighbors({
        nodeId: brandRes.node.id,
        linkTypes: ["has_model"]
      });
      const modelNodes = neighborsResponse.nodes || [];

      const mappedModels: EntityNode[] = modelNodes
        .filter(n => n.type === "model")
        .map(n => ({
          id: n.id,
          type: n.type,
          slug: n.slug,
          name: n.name || {},
          description: n.description || {},
          tags: n.tags || [],
          metadata: n.metadata || {},
          data: n.data || {},
          created_at: "",
          updated_at: n.updatedAt
        }));

      setModels(mappedModels);
    } catch (err) {
      console.error("Failed to load models for brand:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [brandSlug]);

  const getModelName = (model: EntityNode): string => {
    const n = model.name as any;
    if (n && typeof n === "object") {
      return String(n.en || n.default || model.slug || "Unnamed Model");
    }
    return String(model.name || model.slug || "Unnamed Model");
  };

  const getModelDesc = (model: EntityNode): string => {
    const d = model.description as any;
    if (d && typeof d === "object") {
      const desc = String(d.en || d.default || "");
      if (desc) return desc;
    }
    const dataDesc = String((model.data as any)?.summary || (model.metadata as any)?.summary || "");
    if (dataDesc) return dataDesc;

    const bodyType = String((model.data as any)?.body_type || "");
    const fuelType = String((model.data as any)?.fuel_type || "");
    const seg = [bodyType, fuelType].filter(Boolean).join(" · ");
    if (seg) return `${seg} vehicle model.`;

    return "Vehicle model in automotive intelligence graph.";
  };

  const isModel2W = (model: EntityNode): boolean => {
    const tags = model.tags || [];
    const metaType = String(model.metadata?.vehicleType || model.data?.vehicle_type || "").toLowerCase();
    return tags.includes("2w") || tags.includes("two_wheeler") || metaType.includes("2w") || metaType.includes("bike") || metaType.includes("motorcycle");
  };

  const isModel4W = (model: EntityNode): boolean => {
    const tags = model.tags || [];
    const metaType = String(model.metadata?.vehicleType || model.data?.vehicle_type || "").toLowerCase();
    return tags.includes("4w") || tags.includes("four_wheeler") || metaType.includes("4w") || metaType.includes("car") || !isModel2W(model);
  };

  const filteredModels = useMemo(() => {
    return models.filter(model => {
      const name = getModelName(model).toLowerCase();
      const slug = (model.slug || "").toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || name.includes(q) || slug.includes(q);
      if (!matchesSearch) return false;

      if (activeFilter === "4w") return isModel4W(model);
      if (activeFilter === "2w") return isModel2W(model);
      return true;
    }).sort((a, b) => {
      return getModelName(a).localeCompare(getModelName(b));
    });
  }, [models, searchQuery, activeFilter]);

  const count4W = useMemo(() => models.filter(isModel4W).length, [models]);
  const count2W = useMemo(() => models.filter(isModel2W).length, [models]);

  const brandName = brand ? ((brand.name as any)?.en || (brand.name as any)?.default || brand.slug) : brandSlug;

  return (
    <PageLayout className={theme.layout.pageContainer}>
      <TopbarActions>
        <div className="flex items-center gap-3">
          {/* Expandable Search Icon Button matching console/brand */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 gap-2 animate-in fade-in zoom-in-95 duration-150">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder={`Filter ${brandName} models...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs font-medium text-slate-900 outline-none w-44 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Close search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 rounded-xl border border-slate-200 transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                  searchQuery
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                title="Search Models"
              >
                <Search className="w-4 h-4" />
                {searchQuery && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1.5" />
                )}
              </button>
            )}
          </div>

          {/* Status Filter Tabs in Topbar matching console/brand */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0">
            {[
              { id: "all", label: "All Models", count: models.length, icon: Layers },
              { id: "4w", label: "4-Wheelers", count: count4W, icon: Car },
              { id: "2w", label: "2-Wheelers", count: count2W, icon: Bike },
            ].map((f) => {
              const Icon = f.icon;
              const isActive = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id as FilterCategory)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-3xl text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 group relative shrink-0 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-slate-50 text-slate-900 border border-slate-200 font-bold"
                      : "text-slate-500 bg-transparent border border-transparent hover:bg-slate-50 hover:border-slate-200 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"}`} />
                  <span>{f.label}</span>
                  <span
                    className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-slate-200 text-slate-900"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View and Edit Brand Details Button */}
          <button
            type="button"
            onClick={() => router.push(`/console/brand/${brandSlug}/detail`)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-3xl text-[11px] font-semibold uppercase tracking-wider transition-all shrink-0 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>View and Edit Brand Details</span>
          </button>
        </div>
      </TopbarActions>

      <PageContent className={theme.layout.contentWrapper}>
        {/* Models Cards Grid matching console/brand */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-16">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={i} 
                  className="p-7 rounded-3xl bg-white border border-slate-200 h-64 animate-pulse flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100" />
                      <div className="w-20 h-6 rounded-xl bg-slate-100" />
                    </div>
                    <div className="w-32 h-6 rounded-lg bg-slate-100" />
                    <div className="w-48 h-4 rounded-lg bg-slate-100" />
                  </div>
                  <div className="w-full h-8 pt-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl" />
                </div>
              ))
            ) : filteredModels.length > 0 ? (
              filteredModels.map((model, idx) => {
                const modelName = getModelName(model);
                const modelDesc = getModelDesc(model);
                const is2W = isModel2W(model);
                const initialLetter = modelName.charAt(0).toUpperCase() || "M";
                const bodyType = (model.data as any)?.body_type || (model.metadata as any)?.vehicleType || (is2W ? "2-Wheeler" : "4-Wheeler");
                const launchYear = (model.data as any)?.launch_year;

                return (
                  <motion.div
                    key={model.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                    whileHover={{ y: -3 }}
                    onClick={() => router.push(`/console/brand/${brandSlug}/model/${model.slug}`)}
                    className="p-7 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 transition-all group flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Top Meta: Vehicle Category Icon & Slug pill badge */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all flex items-center justify-center text-slate-800 font-bold text-lg">
                          {is2W ? (
                            <Bike className="w-5 h-5" />
                          ) : (
                            <Car className="w-5 h-5" />
                          )}
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider font-mono line-clamp-1 max-w-[140px]">
                          {model.slug.replace(`${brandSlug}-`, "")}
                        </span>
                      </div>

                      {/* Model Title & Description */}
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {modelName}
                      </h3>
                      <p className="text-sm text-slate-500 font-normal mt-2 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                        {modelDesc}
                      </p>
                    </div>

                    {/* Footer: Segment / Body type and Explore action matching brand card */}
                    <div className="flex items-center justify-between pt-6 mt-5 border-t border-slate-100 text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Box className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                        <span className="font-semibold text-slate-700 capitalize">
                          {bodyType}
                          {launchYear ? ` · ${launchYear}` : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600 group-hover:text-slate-900 font-semibold">
                        <span>Explore</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center space-y-4 bg-white border border-slate-200 rounded-3xl p-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-slate-900 font-bold text-base">No models match your filter</p>
                  <p className="text-slate-500 text-xs">Try searching for another keyword or clear current filters.</p>
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </PageContent>
    </PageLayout>
  );
};

const BrandModelsPageWithSuspense = () => (
  <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-screen text-slate-400">Loading Models...</div>}>
    <BrandModelsPage />
  </Suspense>
);

export default BrandModelsPageWithSuspense;
