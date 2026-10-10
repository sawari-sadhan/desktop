"use client";

import React, { useState, useMemo } from "react";
import { 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Check,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { graphClient } from "@lib/core";
import { PageLayout, PageContent } from "../../components";
import { theme } from "../../theme";

interface IngestFormProps {
  vehicleType: "4w" | "2w";
}

export const IngestForm: React.FC<IngestFormProps> = ({ vehicleType }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });
  const [brands, setBrands] = useState<{ id: string; name: any; slug: string; metadata?: any; data?: any }[]>([]);
  const [modelCounts, setModelCounts] = useState<Record<string, { "4w": number; "2w": number; total: number }>>({});
  const [models, setModels] = useState<{ id: string; name: any; slug: string; parent_brand_id?: string }[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [formData, setFormData] = useState({
    slug: "",
    type: "brand",
    name_en: "",
    desc_en: "",
    brandId: "",
    modelId: ""
  });

  // Slug Availability State
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugStatus, setSlugStatus] = useState<{
    isAvailable: boolean | null;
    error: string | null;
    existingType?: string;
  }>({
    isAvailable: null,
    error: null
  });

  // Initial load of brands and models for counting
  React.useEffect(() => {
    const loadBrandsAndCounts = async () => {
      try {
        const [brandRes, modelRes] = await Promise.all([
          graphClient.searchNodes({ query: "", types: ["brand"], limit: 1000 }),
          graphClient.searchNodes({ query: "", types: ["model"], limit: 1000 }).catch(() => ({ nodes: [] }))
        ]);

        // Compute counts of 4w and 2w models per brand
        const counts: Record<string, { "4w": number; "2w": number; total: number }> = {};
        (modelRes.nodes || []).forEach((m) => {
          const parentBrandId = (m.data as any)?.parent_brand_id;
          const vType = ((m.metadata as any)?.vehicleType || "").toString().toLowerCase();
          const tags: string[] = (m.tags || []).map((t: string) => t.toLowerCase());
          const is2W = vType === "2w" || tags.includes("2w") || tags.includes("two-wheeler") || tags.includes("motorcycle") || tags.includes("scooter");

          if (parentBrandId) {
            if (!counts[parentBrandId]) {
              counts[parentBrandId] = { "4w": 0, "2w": 0, total: 0 };
            }
            if (is2W) {
              counts[parentBrandId]["2w"]++;
            } else {
              counts[parentBrandId]["4w"]++;
            }
            counts[parentBrandId].total++;
          }
        });
        setModelCounts(counts);

        setBrands((brandRes.nodes || []).map(b => ({ 
          id: b.id, 
          name: b.name, 
          slug: b.slug,
          metadata: b.metadata,
          data: b.data
        })));
      } catch (err) {
        console.error("Failed to load brands:", err);
      }
    };
    loadBrandsAndCounts();
  }, []);

  // Fetch models whenever a brand is selected (strictly filtered by 4W vs 2W domain)
  React.useEffect(() => {
    if (formData.type === "variant" && formData.brandId) {
      let isMounted = true;
      const loadModels = async () => {
        setIsLoadingModels(true);
        try {
          const selectedBrand = brands.find(b => b.id === formData.brandId);

          // 1. Primary: fetch graph neighbors connected via 'has_model'
          const neighborsRes = await graphClient.getNeighbors({
            nodeId: formData.brandId,
            linkTypes: ["has_model"]
          }).catch(() => ({ nodes: [] }));

          let brandModels = (neighborsRes.nodes || []).filter(n => n.type === "model");

          // 2. Secondary fallback: searchNodes and match parent_brand_id or slug prefix
          if (brandModels.length === 0) {
            const searchRes = await graphClient.searchNodes({ query: "", types: ["model"], limit: 1000 }).catch(() => ({ nodes: [] }));
            brandModels = (searchRes.nodes || []).filter(m => {
              const dataParent = (m.data as any)?.parent_brand_id || (m.data as any)?.parentBrandId;
              const metaParent = (m.metadata as any)?.parent_brand_id || (m.metadata as any)?.parentBrandId;
              const slugPrefix = selectedBrand?.slug ? `${selectedBrand.slug}-` : "";
              const matchesSlug = slugPrefix ? m.slug?.startsWith(slugPrefix) : false;
              return dataParent === formData.brandId || metaParent === formData.brandId || matchesSlug;
            });
          }

          // 3. Strict Domain Filtering: Only retain models belonging to the active vehicleType ("4w" vs "2w")
          const domainFilteredModels = brandModels.filter((m) => {
            const vType = ((m.metadata as any)?.vehicleType || "").toString().toLowerCase();
            const tags: string[] = (m.tags || []).map((t: string) => t.toLowerCase());

            if (vehicleType === "2w") {
              // Only 2-wheel vehicles
              return vType === "2w" || tags.includes("2w") || tags.includes("two-wheeler") || tags.includes("motorcycle") || tags.includes("scooter");
            } else {
              // 4-wheel vehicles: explicitly 4w or not marked as 2w
              if (vType === "2w" || tags.includes("2w") || tags.includes("two-wheeler") || tags.includes("motorcycle") || tags.includes("scooter")) {
                return false;
              }
              return true;
            }
          });

          if (isMounted) {
            setModels(domainFilteredModels.map(m => ({ id: m.id, name: m.name, slug: m.slug })));
          }
        } catch (err) {
          console.error("Failed to load models for brand:", err);
          if (isMounted) setModels([]);
        } finally {
          if (isMounted) setIsLoadingModels(false);
        }
      };
      loadModels();
      return () => { isMounted = false; };
    } else {
      setModels([]);
      setIsLoadingModels(false);
    }
  }, [formData.brandId, formData.type, brands, vehicleType]);

  // Display brands: prioritize brands that have models in the active domain when creating a variant
  const displayBrands = useMemo(() => {
    if (formData.type === "variant") {
      return [...brands].sort((a, b) => {
        const aCount = vehicleType === "4w" 
          ? Number(a.metadata?.model_count_4w ?? modelCounts[a.id]?.["4w"] ?? 0)
          : Number(a.metadata?.model_count_2w ?? modelCounts[a.id]?.["2w"] ?? 0);
        const bCount = vehicleType === "4w"
          ? Number(b.metadata?.model_count_4w ?? modelCounts[b.id]?.["4w"] ?? 0)
          : Number(b.metadata?.model_count_2w ?? modelCounts[b.id]?.["2w"] ?? 0);
        if (bCount !== aCount) return bCount - aCount;
        const aName = (a.name?.en || a.name || "").toString();
        const bName = (b.name?.en || b.name || "").toString();
        return aName.localeCompare(bName);
      });
    }
    return brands;
  }, [brands, formData.type, vehicleType, modelCounts]);

  // Hierarchical Slug Generation
  React.useEffect(() => {
    const brand = brands.find(b => b.id === formData.brandId);
    const model = models.find(m => m.id === formData.modelId);
    const nameSlug = slugify(formData.name_en);

    let finalSlug = nameSlug;
    if (formData.type === "model" && brand) {
      finalSlug = `${brand.slug}-${nameSlug}`;
    } else if (formData.type === "variant" && brand && model) {
      const modelClean = model.slug.replace(`${brand.slug}-`, "");
      finalSlug = `${brand.slug}-${modelClean}-${nameSlug}`;
    }

    setFormData(prev => ({ ...prev, slug: finalSlug }));
  }, [formData.name_en, formData.brandId, formData.modelId, formData.type, brands, models]);

  // Live Slug Availability Check with Debounce
  React.useEffect(() => {
    if (!formData.slug || formData.slug.trim() === "") {
      setSlugStatus({ isAvailable: null, error: null });
      setIsCheckingSlug(false);
      return;
    }

    setIsCheckingSlug(true);
    const timer = setTimeout(async () => {
      try {
        const res = await graphClient.getNode({ id: "", slug: formData.slug });
        if (res && res.node && res.node.id) {
          setSlugStatus({
            isAvailable: false,
            error: `Slug "${formData.slug}" is already taken by an existing ${res.node.type?.toUpperCase() || "node"}.`,
            existingType: res.node.type
          });
        } else {
          setSlugStatus({ isAvailable: true, error: null });
        }
      } catch (err: any) {
        // If node is not found, it is available for ingestion
        setSlugStatus({ isAvailable: true, error: null });
      } finally {
        setIsCheckingSlug(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [formData.slug]);

  const slugify = (text: string) => {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name_en: e.target.value }));
  };

  const handleSave = async () => {
    if (!formData.slug || !formData.name_en) {
      setStatus({ type: "error", message: "Node Identity and Name are required fields." });
      return;
    }
    if (slugStatus.isAvailable === false) {
      setStatus({ 
        type: "error", 
        message: slugStatus.error || `The slug "${formData.slug}" is already registered. Please modify the name to proceed.` 
      });
      return;
    }
    if (formData.type === "model" && !formData.brandId) {
      setStatus({ type: "error", message: "A parent Brand must be selected for vehicle models." });
      return;
    }
    if (formData.type === "variant" && (!formData.brandId || !formData.modelId)) {
      setStatus({ type: "error", message: "Both Brand and Model must be selected for technical variants." });
      return;
    }

    setIsSaving(true);
    setStatus({ type: null, message: "" });

    try {
      const res = await graphClient.createNode({
        type: formData.type,
        slug: formData.slug,
        name: { en: formData.name_en } as any,
        description: { en: formData.desc_en } as any,
        tags: formData.type === "model" ? [formData.type, vehicleType] : [formData.type],
        metadata: { ...(formData.type === "model" && { vehicleType }) } as any,
        data: { 
          icon: formData.type, 
          source: "Manual_Ingest",
          ...(formData.type === "model" && { parent_brand_id: formData.brandId }),
          ...(formData.type === "variant" && { parent_model_id: formData.modelId, parent_brand_id: formData.brandId })
        } as any
      });

      const newNode = res.node;
      if (!newNode) throw new Error("Failed to create node: response was empty");
      
      if (formData.type === "model" && formData.brandId) {
        await graphClient.addLink({
          sourceId: formData.brandId,
          targetId: newNode.id,
          linkType: "has_model",
          metadata: { context: "Manual_Ingest_Hierarchy" } as any
        });
      } else if (formData.type === "variant" && formData.modelId) {
        await graphClient.addLink({
          sourceId: formData.modelId,
          targetId: newNode.id,
          linkType: "has_variant",
          metadata: { context: "Manual_Ingest_Hierarchy" } as any
        });
      }
      
      setFormData({ slug: "", type: "brand", name_en: "", desc_en: "", brandId: "", modelId: "" });
      setSlugStatus({ isAvailable: null, error: null });
      setStatus({ type: "success", message: `Node successfully committed to the knowledge graph (${formData.slug}).` });
    } catch (err: any) {
      console.error("Save failed:", err);
      setStatus({ type: "error", message: err.message || "Failed to persist node to the knowledge graph." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageLayout className={theme.layout.pageContainer}>
      <PageContent className={theme.layout.contentWrapper}>
        
        {/* Status Notification */}
        <AnimatePresence>
          {status.type && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={`p-4 rounded-2xl flex items-center gap-3 border text-sm font-semibold ${
                status.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{status.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Ingestion Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Identity & Attributes */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-[2px] bg-slate-400" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  1. Node Identity & Naming
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Step 01
              </span>
            </div>

            {/* Entity Type Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Entity Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["brand", "model", "variant"] as const).map((t) => {
                  const isSelected = formData.type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: t, modelId: "" }))}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                        isSelected 
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Inputs */}
            <div className="space-y-4 pt-1">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">
                    Primary Display Name (EN)
                  </label>
                  <span className="text-xs text-rose-500 font-semibold">*Required</span>
                </div>
                <input 
                  type="text" 
                  value={formData.name_en}
                  onChange={handleNameChange}
                  placeholder={
                    formData.type === 'brand' 
                      ? 'e.g., Porsche' 
                      : formData.type === 'model' 
                      ? 'e.g., 911 GT3 RS' 
                      : 'e.g., Weissach Package'
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono text-slate-900 outline-none focus:border-slate-400 focus:bg-white transition-all placeholder-slate-400"
                />
              </div>

              {/* Calculated Slug / URI with live availability feedback */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">
                    Calculated Slug / URI
                  </label>
                  <div className="flex items-center gap-2">
                    {isCheckingSlug ? (
                      <span className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
                        <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                        Validating...
                      </span>
                    ) : slugStatus.isAvailable === false ? (
                      <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Already Taken
                      </span>
                    ) : slugStatus.isAvailable === true && formData.slug ? (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Available
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-slate-400">Auto-Derived</span>
                    )}
                  </div>
                </div>

                <div className={`w-full rounded-2xl px-4 py-3 text-sm font-mono flex items-center justify-between border transition-all ${
                  slugStatus.isAvailable === false
                    ? "bg-rose-50/70 border-rose-300 text-rose-900 shadow-sm"
                    : slugStatus.isAvailable === true && formData.slug
                    ? "bg-emerald-50/30 border-emerald-300 text-slate-800"
                    : "bg-slate-100 border-slate-200 text-slate-600"
                }`}>
                  <span className="truncate">{formData.slug || "slug-preview"}</span>
                  <span className={`text-xs uppercase font-bold shrink-0 ml-2 ${
                    slugStatus.isAvailable === false ? "text-rose-500" : "text-slate-400"
                  }`}>RO</span>
                </div>

                {slugStatus.isAvailable === false && slugStatus.error && (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 pt-0.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{slugStatus.error}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Description / Specification Notes
                </label>
                <textarea 
                  rows={4}
                  value={formData.desc_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, desc_en: e.target.value }))}
                  placeholder="Enter technical details, variant specs, regional exclusivity..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-mono text-slate-900 outline-none focus:border-slate-400 focus:bg-white transition-all resize-none placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Taxonomy Relationships & Hierarchy */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-[2px] bg-slate-400" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  2. Hierarchy & Relationship Linking
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Step 02
              </span>
            </div>

            <div className="space-y-5">
              {/* Brand Informational Box */}
              {formData.type === "brand" && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Sparkles className="w-4 h-4 text-slate-600" />
                    <span>Root Level Brand Entity</span>
                  </div>
                  <p className="text-xs font-normal text-slate-500 leading-relaxed">
                    Brand entities serve as top-level nodes in the knowledge graph. They do not require a parent relationship. Once created, models can be linked directly beneath this brand.
                  </p>
                </div>
              )}

              {/* Brand Selection for Model & Variant */}
              <AnimatePresence mode="wait">
                {(formData.type === "model" || formData.type === "variant") && (
                  <motion.div 
                    initial={{ opacity: 0, y: 6 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -6 }} 
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">
                        Link to Parent Brand
                      </label>
                      <span className="text-xs font-semibold text-slate-400">
                        {displayBrands.length} Brands Available
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                      <div className={`flex flex-wrap gap-2 overflow-y-auto px-1 custom-scrollbar ${formData.type === "model" ? "max-h-[380px]" : "max-h-[220px]"}`}>
                        {displayBrands.map((brand) => {
                          const isSelected = formData.brandId === brand.id;
                          const c4w = Number(brand.metadata?.model_count_4w ?? modelCounts[brand.id]?.["4w"] ?? 0);
                          const c2w = Number(brand.metadata?.model_count_2w ?? modelCounts[brand.id]?.["2w"] ?? 0);
                          const count = vehicleType === "4w" ? c4w : c2w;
                          const unit = vehicleType === "4w" ? "4W" : "2W";

                          return (
                            <button
                              key={brand.id}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, brandId: isSelected ? "" : brand.id, modelId: "" }))}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-2 ${
                                isSelected 
                                  ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50"
                              }`}
                            >
                              <span>{brand.name?.en || brand.name}</span>
                              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold font-mono transition-colors ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : count > 0
                                  ? "bg-slate-100 text-slate-800 border border-slate-200"
                                  : "bg-slate-100/60 text-slate-400 border border-slate-200/50"
                              }`}>
                                {count} {unit}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Model Selection for Variant (strictly filtered to active 4W or 2W category) */}
              <AnimatePresence mode="wait">
                {formData.type === "variant" && formData.brandId && (
                  <motion.div 
                    initial={{ opacity: 0, y: 6 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -6 }} 
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">
                        Link to Parent Model ({vehicleType.toUpperCase()})
                      </label>
                      <span className="text-xs font-semibold text-slate-400">
                        {isLoadingModels ? "Loading..." : `${models.length} ${vehicleType.toUpperCase()} Models Available`}
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                      <div className="flex flex-wrap gap-2 max-h-[240px] overflow-y-auto px-1 custom-scrollbar">
                        {isLoadingModels ? (
                          <div className="w-full py-6 text-xs font-semibold text-slate-400 text-center flex items-center justify-center gap-2">
                            <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                            <span>Loading {vehicleType.toUpperCase()} models for brand...</span>
                          </div>
                        ) : models.length > 0 ? (
                          models.map((model) => {
                            const isSelected = formData.modelId === model.id;
                            return (
                              <button
                                key={model.id}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, modelId: isSelected ? "" : model.id }))}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border cursor-pointer ${
                                  isSelected 
                                    ? "bg-slate-900 text-white border-slate-900" 
                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900"
                                }`}
                              >
                                {model.name?.en || model.name}
                              </button>
                            );
                          })
                        ) : (
                          <div className="w-full py-6 text-xs font-semibold text-slate-400 text-center">
                            No {vehicleType.toUpperCase()} models discovered under this brand
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Commit Action Button */}
            <div className="pt-4 border-t border-slate-100">
              <button 
                onClick={handleSave}
                disabled={
                  isSaving || 
                  isCheckingSlug ||
                  slugStatus.isAvailable === false ||
                  !formData.slug || 
                  !formData.name_en || 
                  (formData.type === 'model' && !formData.brandId) || 
                  (formData.type === 'variant' && (!formData.brandId || !formData.modelId))
                }
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-slate-900 text-white rounded-2xl text-sm font-semibold transition-all hover:bg-slate-800 disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-400/20 border-t-white rounded-full animate-spin" />
                    <span>Committing to Knowledge Graph...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Commit Node to Registry</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </PageContent>
    </PageLayout>
  );
};