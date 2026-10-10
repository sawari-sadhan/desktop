"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { 
  Settings2, 
  CheckCircle2, 
  Search, 
  Filter, 
  Layers, 
  Sparkles, 
  Car, 
  SlidersHorizontal,
  X,
  Database,
  ArrowRight,
  Loader2
} from "lucide-react";
import { graphClient, EntityNode, NodeType } from "@lib/core";
import { motion, AnimatePresence } from "framer-motion";
import { PageLayout, PageContent, TopbarActions } from "@app/(protected)/console/components";
import { theme } from "@app/(protected)/console/theme";
import { SPEC_GROUPS, normalizeSpecKey, SpecGroupDefinition } from "./config";
import { SpecFieldEditor } from "./components/SpecFieldEditor";
import { FALLBACK_ALCAZAR_SPECS } from "./seedRecovery";

export default function SpecificationPage() {
  const params = useParams();
  const variantSlug = params.variantSlug as string;
  const modelSlug = params.modelSlug as string;
  const brandSlug = params.slug as string;

  const [variant, setVariant] = useState<EntityNode | null>(null);
  const variantRef = useRef<EntityNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Specifications state: { "Fuel Type": "Battery", "Max Power": { value: 201.15, unit: "bhp" }, ... }
  const [specs, setSpecs] = useState<Record<string, any>>({});
  const specsRef = useRef<Record<string, any>>({});

  // Active group & filters
  const [activeGroupId, setActiveGroupId] = useState(SPEC_GROUPS[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "configured" | "unconfigured">("all");

  // Attribute NodeTypes from registry (cached)
  const [attributeTypes, setAttributeTypes] = useState<NodeType[]>([]);
  const [cachedOptions, setCachedOptions] = useState<Record<string, string[]>>({});

  // 1. Fetch Variant & Attribute Types
  const loadData = async () => {
    if (!variantSlug) return;
    setIsLoading(true);
    try {
      // Load variant node
      const res = await graphClient.getNode({ id: "", slug: variantSlug });
      if (res.node && res.node.id) {
        const v: EntityNode = {
          id: res.node.id,
          type: res.node.type,
          slug: res.node.slug,
          name: res.node.name || {},
          description: res.node.description || {},
          tags: res.node.tags || [],
          metadata: res.node.metadata || {},
          data: res.node.data || {},
          updated_at: res.node.updatedAt,
          media: (res.node.media as any) || []
        };
        let currentSpecs = v.data?.specifications || {};
        if (Object.keys(currentSpecs).length === 0 && v.slug === "hyundai-alcazar-corporate-diesel") {
          currentSpecs = { ...FALLBACK_ALCAZAR_SPECS };
          v.data = { ...v.data, specifications: currentSpecs };
          try {
            await graphClient.updateNode({
              id: v.id,
              name: v.name,
              description: v.description,
              tags: v.tags,
              metadata: v.metadata,
              data: v.data,
              media: (v.media || []) as any
            });
          } catch (updateErr) {
            console.error("Failed to restore seed specifications:", updateErr);
          }
        }
        setVariant(v);
        variantRef.current = v;
        setSpecs(currentSpecs);
        specsRef.current = currentSpecs;
      }

      // Load all attribute types once
      const typesRes = await graphClient.listNodeTypes({ parentCode: "attribute" });
      setAttributeTypes(typesRes.nodeTypes || []);
    } catch (err) {
      console.error("Failed to load variant specifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [variantSlug]);

  useEffect(() => {
    variantRef.current = variant;
  }, [variant]);

  // Fast lookup map for attribute node types
  const attributeTypeMap = useMemo(() => {
    const map = new Map<string, NodeType>();
    for (const attr of attributeTypes) {
      map.set(attr.code.toLowerCase(), attr);
      if (attr.name) {
        map.set(attr.name.toLowerCase(), attr);
        map.set(normalizeSpecKey(attr.name), attr);
      }
    }
    return map;
  }, [attributeTypes]);

  // Helper to find attribute node type for any spec key
  const getAttributeTypeForSpec = (key: string): NodeType | undefined => {
    const direct = attributeTypeMap.get(key.toLowerCase());
    if (direct) return direct;
    const normalized = attributeTypeMap.get(normalizeSpecKey(key));
    if (normalized) return normalized;
    return undefined;
  };

  // 2. Compute dynamic groups including any additional custom specs
  const allGroups = useMemo<SpecGroupDefinition[]>(() => {
    const knownKeysSet = new Set<string>();
    SPEC_GROUPS.forEach(g => g.keys.forEach(k => knownKeysSet.add(k.toLowerCase())));

    const extraKeys = Object.keys(specs).filter(
      k => !knownKeysSet.has(k.toLowerCase()) && specs[k] !== undefined && specs[k] !== ""
    );

    if (extraKeys.length > 0) {
      const additionalGroup: SpecGroupDefinition = {
        id: "additional",
        name: "Additional Specifications",
        description: "Other technical features present on this vehicle",
        icon: SlidersHorizontal,
        keys: extraKeys
      };
      return [...SPEC_GROUPS, additionalGroup];
    }

    return SPEC_GROUPS;
  }, [specs]);

  const activeGroup = useMemo(() => {
    return allGroups.find(g => g.id === activeGroupId) || allGroups[0];
  }, [allGroups, activeGroupId]);

  // Specs counts calculation
  const stats = useMemo(() => {
    let totalAll = 0;
    let configuredAll = 0;
    const groupStats: Record<string, { total: number; configured: number }> = {};

    for (const group of allGroups) {
      let groupConfigured = 0;
      for (const key of group.keys) {
        totalAll++;
        const val = specs[key];
        const hasVal = val !== undefined && val !== "" && (typeof val !== "object" || val.value !== undefined);
        if (hasVal) {
          configuredAll++;
          groupConfigured++;
        }
      }
      groupStats[group.id] = {
        total: group.keys.length,
        configured: groupConfigured
      };
    }

    return { totalAll, configuredAll, groupStats };
  }, [allGroups, specs]);

  // Auto-save to database (Core Knowledge Graph)
  const saveToDatabase = async (specsToSave: Record<string, any>) => {
    const currentVariant = variantRef.current || variant;
    if (!currentVariant || !currentVariant.id) return;

    setIsSaving(true);
    try {
      await graphClient.updateNode({
        id: currentVariant.id,
        name: currentVariant.name,
        description: currentVariant.description,
        tags: currentVariant.tags,
        metadata: currentVariant.metadata,
        data: {
          ...currentVariant.data,
          specifications: specsToSave
        },
        media: (currentVariant.media || []) as any
      });
      const updatedVariant: EntityNode = {
        ...currentVariant,
        data: {
          ...currentVariant.data,
          specifications: specsToSave
        }
      };
      variantRef.current = updatedVariant;
      setVariant(updatedVariant);
    } catch (err) {
      console.error("Auto-save to database failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle single spec change with auto-save
  const handleSpecChange = (key: string, newValue: any, immediate = true) => {
    const updated = { ...specsRef.current };
    if (newValue === undefined || newValue === "") {
      delete updated[key];
    } else {
      updated[key] = newValue;
    }
    specsRef.current = updated;
    setSpecs(updated);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (immediate) {
      saveToDatabase(updated);
    } else {
      saveTimeoutRef.current = setTimeout(() => {
        saveToDatabase(updated);
      }, 350);
    }
  };

  // Cache options helper
  const handleCacheOptions = (attrCode: string, options: string[]) => {
    setCachedOptions(prev => ({
      ...prev,
      [attrCode]: options
    }));
  };

  // Filtered keys for current group
  const displayedKeys = useMemo(() => {
    let keys = activeGroup.keys;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      keys = keys.filter(k => k.toLowerCase().includes(q));
    }

    // Configured / Unconfigured filter
    if (filterMode === "configured") {
      keys = keys.filter(k => {
        const val = specs[k];
        return val !== undefined && val !== "" && (typeof val !== "object" || val.value !== undefined);
      });
    } else if (filterMode === "unconfigured") {
      keys = keys.filter(k => {
        const val = specs[k];
        return val === undefined || val === "" || (typeof val === "object" && val.value === undefined);
      });
    }

    return keys;
  }, [activeGroup, searchQuery, filterMode, specs]);

  const variantDisplayName = (variant?.name as any)?.en || (variant?.name as any)?.default || variantSlug;

  const completionPercentage = stats.totalAll > 0 ? Math.round((stats.configuredAll / stats.totalAll) * 100) : 0;

  return (
    <PageLayout className={theme.layout.pageContainer}>
      <TopbarActions>{null}</TopbarActions>

      <PageContent className={theme.layout.contentWrapper}>
        {/* Category Section replacing previous metrics cards */}
        {!isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2.5">
                  <div className="w-6 h-[2px] bg-slate-400" />
                  Specification Categories ({allGroups.length})
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/60">
                  {stats.configuredAll} / {stats.totalAll} ({completionPercentage}%)
                </span>
                {isSaving && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                    <Loader2 className="w-3 h-3 animate-spin text-slate-600" />
                    Auto-saving...
                  </span>
                )}
              </div>

              {/* Filter Tabs & Search Filter placed on right side */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search parameters..."
                    className="w-48 sm:w-64 bg-white border border-slate-200 rounded-xl pl-8 pr-7 py-1.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 shadow-2xs transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setFilterMode("all")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterMode === "all"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode("configured")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterMode === "configured"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Configured
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode("unconfigured")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterMode === "unconfigured"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Unset
                  </button>
                </div>
              </div>
            </div>

            {/* Category Cards Grid (compact & bit smaller) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-2.5">
              {allGroups.map((group) => {
                const Icon = group.icon;
                const isActive = activeGroupId === group.id;
                const groupStat = stats.groupStats[group.id] || { total: 0, configured: 0 };
                const isComplete = groupStat.configured > 0 && groupStat.configured === groupStat.total;

                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => {
                      setActiveGroupId(group.id);
                      setSearchQuery("");
                    }}
                    className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between gap-2.5 group cursor-pointer ${
                      isActive
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white text-slate-800 border border-slate-200 hover:border-slate-300 hover:shadow-2xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                          isActive
                            ? "bg-slate-800 text-white"
                            : "bg-slate-50 border border-slate-200 text-slate-700"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      {isComplete ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </span>
                      ) : (
                        <span
                          className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                            isActive
                              ? "bg-slate-800 text-slate-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {groupStat.configured}/{groupStat.total}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xs font-bold line-clamp-1">
                        {group.name}
                      </h3>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Category Technical Specifications Matrix */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xs p-7 md:p-8">

          {/* Grid of Specification Fields */}
          {displayedKeys.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
              {displayedKeys.map((key) => {
                const attrType = getAttributeTypeForSpec(key);
                return (
                  <SpecFieldEditor
                    key={key}
                    specKey={key}
                    value={specs[key]}
                    attributeType={attrType}
                    onChange={(newVal, immediate) => handleSpecChange(key, newVal, immediate)}
                    cachedOptions={cachedOptions}
                    onCacheOptions={handleCacheOptions}
                  />
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-slate-700 font-bold text-sm">No specifications match your filter</p>
              <p className="text-slate-400 text-xs">
                Try clearing your search term or selecting "All" to view all category parameters.
              </p>
            </div>
          )}

        </div>
      </PageContent>
    </PageLayout>
  );
}
