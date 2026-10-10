"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Layers, 
  ArrowRight, 
  Plus, 
  Car, 
  Bike,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { graphClient, EntityNode } from "@lib/core";
import { PageLayout, PageContent, TopbarActions } from "../components";
import { theme } from "../theme";

type FilterCategory = "all" | "4w" | "2w";

export default function BrandRegistryPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<EntityNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  const loadBrands = async () => {
    setIsLoading(true);
    try {
      const response = await graphClient.searchNodes({
        query: "",
        types: ["brand"],
        limit: 200,
        vector: []
      });
      
      const mappedBrands: EntityNode[] = (response.nodes || []).map(n => ({
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
      
      setBrands(mappedBrands);
    } catch (err) {
      console.error("Failed to load brands:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const getBrandName = (brand: EntityNode): string => {
    const n = brand.name as any;
    if (n && typeof n === "object") {
      return String(n.en || n.default || brand.slug || "Unnamed Brand");
    }
    return String(brand.name || brand.slug || "Unnamed Brand");
  };

  const getBrandDesc = (brand: EntityNode): string => {
    const d = brand.description as any;
    if (d && typeof d === "object") {
      return String(d.en || d.default || "");
    }
    return String(brand.description || "");
  };

  // Filter and sort brands
  const filteredBrands = useMemo(() => {
    return brands.filter(brand => {
      const name = getBrandName(brand).toLowerCase();
      const slug = (brand.slug || "").toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || name.includes(q) || slug.includes(q);
      if (!matchesSearch) return false;

      const c4w = Number(brand.metadata?.model_count_4w ?? 0);
      const c2w = Number(brand.metadata?.model_count_2w ?? 0);

      if (activeFilter === "4w") return c4w > 0;
      if (activeFilter === "2w") return c2w > 0;
      return true;
    }).sort((a, b) => {
      const totalA = Number(a.metadata?.total_models ?? (Number(a.metadata?.model_count_4w ?? 0) + Number(a.metadata?.model_count_2w ?? 0)));
      const totalB = Number(b.metadata?.total_models ?? (Number(b.metadata?.model_count_4w ?? 0) + Number(b.metadata?.model_count_2w ?? 0)));
      if (totalB !== totalA) return totalB - totalA;
      return getBrandName(a).localeCompare(getBrandName(b));
    });
  }, [brands, searchQuery, activeFilter]);

  const count4WBrands = useMemo(() => {
    return brands.filter(b => Number(b.metadata?.model_count_4w ?? 0) > 0).length;
  }, [brands]);

  const count2WBrands = useMemo(() => {
    return brands.filter(b => Number(b.metadata?.model_count_2w ?? 0) > 0).length;
  }, [brands]);

  return (
    <PageLayout className={theme.layout.pageContainer}>
      {/* Topbar Actions Portal matching console/sample/list */}
      <TopbarActions>
        <div className="flex items-center gap-3">
          {/* Expandable Search Icon Button matching console/sample/list */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 gap-2 animate-in fade-in zoom-in-95 duration-150">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Filter brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs font-medium text-slate-900 outline-none w-44 placeholder:text-slate-400"
                />
                <button
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
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 rounded-xl border border-slate-200 transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                  searchQuery
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                title="Search Brands"
              >
                <Search className="w-4 h-4" />
                {searchQuery && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1.5" />
                )}
              </button>
            )}
          </div>

          {/* Status Filter Tabs in Topbar matching console/sample/list */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0">
            {[
              { id: "all", label: "All Brands", count: brands.length, icon: Layers },
              { id: "4w", label: "4-Wheelers", count: count4WBrands, icon: Car },
              { id: "2w", label: "2-Wheelers", count: count2WBrands, icon: Bike },
            ].map((f) => {
              const Icon = f.icon;
              const isActive = activeFilter === f.id;
              return (
                <button
                  key={f.id}
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

          {/* Ingest Brand Button in Topbar */}
          <button
            onClick={() => router.push("/console/ingest/4w")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-3xl text-[11px] font-semibold uppercase tracking-wider transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest Brand</span>
          </button>
        </div>
      </TopbarActions>

      <PageContent className={theme.layout.contentWrapper}>
        {/* Brand Cards Grid */}
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
            ) : filteredBrands.length > 0 ? (
              filteredBrands.map((brand, idx) => {
                const brandName = getBrandName(brand);
                const brandDesc = getBrandDesc(brand);
                const c4w = Number(brand.metadata?.model_count_4w ?? 0);
                const c2w = Number(brand.metadata?.model_count_2w ?? 0);
                const totalModels = Number(brand.metadata?.total_models ?? (c4w + c2w));
                const initialLetter = brandName.charAt(0).toUpperCase() || "?";

                return (
                  <motion.div
                    key={brand.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                    whileHover={{ y: -3 }}
                    onClick={() => router.push(`/console/brand/${brand.slug}`)}
                    className="p-7 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 transition-all group flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Top Meta: Initial Letter icon & Slug pill badge */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all flex items-center justify-center text-slate-800 font-bold text-lg uppercase">
                          {initialLetter}
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider font-mono">
                          {brand.slug}
                        </span>
                      </div>

                      {/* Brand Title & Description */}
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {brandName}
                      </h3>
                      <p className="text-sm text-slate-500 font-normal mt-2 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                        {brandDesc || "Manufacturer registered in vehicle knowledge ontology."}
                      </p>
                    </div>

                    {/* Footer: Model Count directly in place of HQ */}
                    <div className="flex items-center justify-between pt-6 mt-5 border-t border-slate-100 text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Layers className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                        <span className="font-semibold text-slate-700">
                          {totalModels > 0 ? (
                            <>
                              <span className="font-bold text-slate-900">{totalModels}</span> {totalModels === 1 ? "Model" : "Models"}
                              {c4w > 0 && c2w > 0 ? (
                                <span className="text-slate-400 font-normal ml-1.5">({c4w} 4W · {c2w} 2W)</span>
                              ) : c4w > 0 ? (
                                <span className="text-slate-400 font-normal ml-1.5">({c4w} 4W)</span>
                              ) : c2w > 0 ? (
                                <span className="text-slate-400 font-normal ml-1.5">({c2w} 2W)</span>
                              ) : null}
                            </>
                          ) : (
                            <span className="text-slate-400 font-normal">0 Models</span>
                          )}
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
                  <p className="text-slate-900 font-bold text-base">No brands match your filter</p>
                  <p className="text-slate-500 text-xs">Try searching for another keyword or clear current filters.</p>
                </div>
                {searchQuery && (
                  <button
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
}
