"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Layers, 
  ArrowRight, 
  X,
  Fuel,
  Zap,
  Gauge,
  SlidersHorizontal,
  Car,
  Box,
  Settings
} from "lucide-react";
import { graphClient, EntityNode } from "@lib/core";
import { PageLayout, PageContent, TopbarActions } from "@app/(protected)/console/components";
import { theme } from "@app/(protected)/console/theme";

type FilterCategory = "all" | "petrol" | "diesel" | "electric" | "auto";

const ModelVariantsPage = () => {
  const router = useRouter();
  const params = useParams();
  const brandSlug = (params.slug as string) || "";
  const modelSlug = (params.modelSlug as string) || "";

  const [model, setModel] = useState<EntityNode | null>(null);
  const [variants, setVariants] = useState<EntityNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  const loadData = async () => {
    if (!modelSlug) return;
    setIsLoading(true);
    try {
      // 1. Fetch Model Node
      const modelRes = await graphClient.getNode({ id: "", slug: modelSlug });
      if (modelRes.node) {
        setModel({
          id: modelRes.node.id,
          type: modelRes.node.type,
          slug: modelRes.node.slug,
          name: modelRes.node.name || {},
          description: modelRes.node.description || {},
          tags: modelRes.node.tags || [],
          metadata: modelRes.node.metadata || {},
          data: modelRes.node.data || {},
          created_at: "",
          updated_at: modelRes.node.updatedAt
        });

        // 2. Fetch Variants for this Model
        const neighbors = await graphClient.getNeighbors({
          nodeId: modelRes.node.id,
          linkTypes: ["has_variant"]
        });

        const variantNodes = (neighbors.nodes || []).filter(n => n.type === "variant");
        const mappedVariants: EntityNode[] = variantNodes.map(n => ({
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

        setVariants(mappedVariants);
      }
    } catch (err) {
      console.error("Failed to load variants for model:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [modelSlug]);

  const getVariantName = (variant: EntityNode): string => {
    const n = variant.name as any;
    if (n && typeof n === "object") {
      return String(n.en || n.default || variant.slug || "Unnamed Variant");
    }
    return String(variant.name || variant.slug || "Unnamed Variant");
  };

  const getModelName = (m: EntityNode | null, fallback: string): string => {
    if (!m) return fallback.replace(/-/g, " ");
    const n = m.name as any;
    if (n && typeof n === "object") {
      return String(n.en || n.default || m.slug || fallback);
    }
    return String(m.name || m.slug || fallback);
  };

  const getVariantSpecs = (variant: EntityNode) => {
    const specs = (variant.data as any)?.specifications || {};
    const fuelType = String(specs["Fuel Type"] || (variant.data as any)?.fuel_type || "");
    const transmission = String(specs["Transmission Type"] || (variant.data as any)?.transmission || "");
    const engine = String(specs["Engine Type"] || "");
    const seating = String(specs["Seating Capacity"] || "");
    const power = specs["Max Power"]?.value 
      ? `${specs["Max Power"].value} bhp` 
      : (typeof specs["Max Power"] === "string" ? specs["Max Power"] : "");
    const displacement = specs["Displacement"]?.value 
      ? `${specs["Displacement"].value} cc` 
      : (typeof specs["Displacement"] === "string" ? specs["Displacement"] : "");

    return { fuelType, transmission, engine, seating, power, displacement };
  };

  const getVariantDesc = (variant: EntityNode): string => {
    const d = variant.description as any;
    if (d && typeof d === "object") {
      const desc = String(d.en || d.default || "");
      if (desc) return desc;
    }
    const { fuelType, transmission, engine, displacement, seating, power } = getVariantSpecs(variant);
    const parts = [
      engine || displacement,
      fuelType,
      transmission,
      power,
      seating ? `${seating} Seats` : ""
    ].filter(Boolean);

    if (parts.length > 0) {
      return `${parts.join(" · ")}.`;
    }

    const summary = (variant.data as any)?.summary || (variant.metadata as any)?.summary;
    if (summary) return String(summary);

    return "Vehicle trim & variant in automotive intelligence graph.";
  };

  const isPetrol = (v: EntityNode) => {
    const specs = (v.data as any)?.specifications || {};
    const fuel = (specs["Fuel Type"] || "").toLowerCase();
    const name = getVariantName(v).toLowerCase();
    const slug = (v.slug || "").toLowerCase();
    return fuel.includes("petrol") || name.includes("petrol") || slug.includes("petrol");
  };

  const isDiesel = (v: EntityNode) => {
    const specs = (v.data as any)?.specifications || {};
    const fuel = (specs["Fuel Type"] || "").toLowerCase();
    const name = getVariantName(v).toLowerCase();
    const slug = (v.slug || "").toLowerCase();
    return fuel.includes("diesel") || name.includes("diesel") || slug.includes("diesel") || name.includes("crdi") || slug.includes("crdi");
  };

  const isElectric = (v: EntityNode) => {
    const specs = (v.data as any)?.specifications || {};
    const fuel = (specs["Fuel Type"] || "").toLowerCase();
    const name = getVariantName(v).toLowerCase();
    const slug = (v.slug || "").toLowerCase();
    return fuel.includes("electric") || fuel.includes("ev") || name.includes("electric") || name.includes("ev") || slug.includes("ev");
  };

  const isAutomatic = (v: EntityNode) => {
    const specs = (v.data as any)?.specifications || {};
    const trans = (specs["Transmission Type"] || "").toLowerCase();
    const name = getVariantName(v).toLowerCase();
    const slug = (v.slug || "").toLowerCase();
    return trans.includes("auto") || trans.includes("at") || trans.includes("dct") || trans.includes("cvt") || trans.includes("amt") ||
           name.includes(" at") || name.includes(" dct") || name.includes(" cvt") || name.includes(" amt") || name.includes("automatic") ||
           slug.endsWith("-at") || slug.includes("-dct") || slug.includes("-automatic");
  };

  const filteredVariants = useMemo(() => {
    return variants.filter(variant => {
      const name = getVariantName(variant).toLowerCase();
      const slug = (variant.slug || "").toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || name.includes(q) || slug.includes(q);
      if (!matchesSearch) return false;

      if (activeFilter === "petrol") return isPetrol(variant);
      if (activeFilter === "diesel") return isDiesel(variant);
      if (activeFilter === "electric") return isElectric(variant);
      if (activeFilter === "auto") return isAutomatic(variant);
      return true;
    }).sort((a, b) => {
      return getVariantName(a).localeCompare(getVariantName(b));
    });
  }, [variants, searchQuery, activeFilter]);

  const countPetrol = useMemo(() => variants.filter(isPetrol).length, [variants]);
  const countDiesel = useMemo(() => variants.filter(isDiesel).length, [variants]);
  const countElectric = useMemo(() => variants.filter(isElectric).length, [variants]);
  const countAuto = useMemo(() => variants.filter(isAutomatic).length, [variants]);

  const availableFilters = useMemo(() => {
    const list: { id: FilterCategory; label: string; count: number; icon: React.ComponentType<{ className?: string }> }[] = [
      { id: "all", label: "All Variants", count: variants.length, icon: Layers }
    ];
    if (countPetrol > 0) {
      list.push({ id: "petrol", label: "Petrol", count: countPetrol, icon: Fuel });
    }
    if (countDiesel > 0) {
      list.push({ id: "diesel", label: "Diesel", count: countDiesel, icon: Fuel });
    }
    if (countElectric > 0) {
      list.push({ id: "electric", label: "Electric", count: countElectric, icon: Zap });
    }
    if (countAuto > 0) {
      list.push({ id: "auto", label: "Automatic", count: countAuto, icon: Gauge });
    }
    return list;
  }, [variants, countPetrol, countDiesel, countElectric, countAuto]);

  const modelDisplayName = getModelName(model, modelSlug);

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
                  placeholder={`Filter ${modelDisplayName} variants...`}
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
                title="Search Variants"
              >
                <Search className="w-4 h-4" />
                {searchQuery && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1.5" />
                )}
              </button>
            )}
          </div>

          {/* Dynamic Filter Tabs in Topbar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0">
            {availableFilters.map((f) => {
              const Icon = f.icon;
              const isActive = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id)}
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
        </div>
      </TopbarActions>

      <PageContent className={theme.layout.contentWrapper}>
        {/* Variants Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
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
            ) : filteredVariants.length > 0 ? (
              filteredVariants.map((variant, idx) => {
                const variantName = getVariantName(variant);
                const variantDesc = getVariantDesc(variant);
                const { fuelType, transmission, seating } = getVariantSpecs(variant);
                const isEV = isElectric(variant);
                const isAuto = isAutomatic(variant);

                return (
                  <motion.div
                    key={variant.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                    whileHover={{ y: -3 }}
                    onClick={() => router.push(`/console/brand/${brandSlug}/model/${modelSlug}/variant/${variant.slug}`)}
                    className="p-7 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 transition-all group flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Top Meta: Trim Icon */}
                      <div className="mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all flex items-center justify-center text-slate-800 font-bold text-lg">
                          {isEV ? (
                            <Zap className="w-5 h-5 text-amber-500 group-hover:text-white" />
                          ) : isAuto ? (
                            <Gauge className="w-5 h-5" />
                          ) : (
                            <Fuel className="w-5 h-5" />
                          )}
                        </div>
                      </div>

                      {/* Variant Title & Description */}
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {variantName}
                      </h3>
                      <p className="text-sm text-slate-500 font-normal mt-2 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                        {variantDesc}
                      </p>
                    </div>

                    {/* Footer: Transmission/Fuel specs and Configure action */}
                    <div className="flex items-center justify-between pt-6 mt-5 border-t border-slate-100 text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Box className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                        <span className="font-semibold text-slate-700 capitalize">
                          {[fuelType, transmission].filter(Boolean).join(" · ") || "Standard"}
                          {seating ? ` · ${seating}S` : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600 group-hover:text-slate-900 font-semibold">
                        <span>Configure</span>
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
                  <p className="text-slate-900 font-bold text-base">No variants match your filter</p>
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

const ModelVariantsPageWithSuspense = () => (
  <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-screen text-slate-400">Loading Variants...</div>}>
    <ModelVariantsPage />
  </Suspense>
);

export default ModelVariantsPageWithSuspense;
