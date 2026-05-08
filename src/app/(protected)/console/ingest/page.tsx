"use client";

import React, { useState } from "react";
import { Save, Database, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { entityApi } from "$lib/v1/graph/entity";
import { edgeApi } from "$lib/v1/graph/edge";

const IngestPage = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" });
  const [brands, setBrands] = useState<{id: string, name: any, slug: string}[]>([]);
  const [models, setModels] = useState<{id: string, name: any, slug: string, parent_brand_id?: string}[]>([]);
  const [variants, setVariants] = useState<{id: string, name: any, slug: string, parent_model_id?: string}[]>([]);
  const [formData, setFormData] = useState({
    slug: "",
    type: "brand",
    name_en: "",
    desc_en: "",
    brandId: "",
    modelId: "",
    variantId: "",
    vehicle_type: "4w-ice"
  });

  // Initial load of brands
  React.useEffect(() => {
    const loadBrands = async () => {
      try {
        const data = await entityApi.getBrands();
        setBrands(data.map(b => ({ id: b.id, name: b.name, slug: b.slug })));
      } catch (err) {
        console.error("Failed to load brands:", err);
      }
    };
    loadBrands();
  }, []);

  // Fetch models whenever a brand is selected
  React.useEffect(() => {
    if ((formData.type === "variant" || formData.type === "model" || formData.type === "release") && formData.brandId) {
      const loadModels = async () => {
        try {
          const allModels = await entityApi.listByType('model');
          const filtered = allModels
            .filter(m => m.data?.parent_brand_id === formData.brandId)
            .map(m => ({ id: m.id, name: m.name, slug: m.slug }));
          setModels(filtered);
        } catch (err) {
          console.error("Failed to load models:", err);
        }
      };
      loadModels();
    }
  }, [formData.brandId, formData.type]);

  // Fetch variants whenever a model is selected (for release selection)
  React.useEffect(() => {
    if (formData.type === "release" && formData.modelId) {
      const loadVariants = async () => {
        try {
          const allVariants = await entityApi.listByType('variant');
          const filtered = allVariants
            .filter(v => v.data?.parent_model_id === formData.modelId)
            .map(v => ({ id: v.id, name: v.name, slug: v.slug }));
          setVariants(filtered);
        } catch (err) {
          console.error("Failed to load variants:", err);
        }
      };
      loadVariants();
    } else {
      setVariants([]);
    }
  }, [formData.modelId, formData.type]);

  // Hierarchical Slug Generation
  React.useEffect(() => {
    const brand = brands.find(b => b.id === formData.brandId);
    const model = models.find(m => m.id === formData.modelId);
    const variant = variants.find(v => v.id === formData.variantId);
    const nameSlug = slugify(formData.name_en);

    let finalSlug = nameSlug;
    if (formData.type === "model" && brand) {
      finalSlug = `${brand.slug}-${nameSlug}`;
    } else if (formData.type === "variant" && brand && model) {
      const modelClean = model.slug.replace(`${brand.slug}-`, "");
      finalSlug = `${brand.slug}-${modelClean}-${nameSlug}`;
    } else if (formData.type === "release" && brand && model && variant) {
      const modelClean = model.slug.replace(`${brand.slug}-`, "");
      const variantClean = variant.slug.replace(`${brand.slug}-${modelClean}-`, "");
      finalSlug = `${brand.slug}-${modelClean}-${variantClean}-${nameSlug}`;
    }

    setFormData(prev => ({ ...prev, slug: finalSlug }));
  }, [formData.name_en, formData.brandId, formData.modelId, formData.variantId, formData.type, brands, models, variants]);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name_en: e.target.value }));
  };

  const handleSave = async () => {
    if (!formData.slug || !formData.name_en) {
      setStatus({ type: "error", message: "Identity and Name are required fields." });
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

    if (formData.type === "release" && (!formData.brandId || !formData.modelId || !formData.variantId)) {
      setStatus({ type: "error", message: "Full hierarchy (Brand, Model, and Variant) must be selected for releases." });
      return;
    }
    
    setIsSaving(true);
    setStatus({ type: null, message: "" });

    try {
      const payload = {
        type: formData.type,
        slug: formData.slug,
        name: { en: formData.name_en },
        description: { en: formData.desc_en },
        data: { 
          icon: formData.type, 
          source: "Manual_Ingest",
          ...(formData.type === "model" && { parent_brand_id: formData.brandId, vehicle_type: formData.vehicle_type }),
          ...(formData.type === "variant" && { parent_model_id: formData.modelId, parent_brand_id: formData.brandId }),
          ...(formData.type === "release" && { parent_variant_id: formData.variantId, parent_model_id: formData.modelId, parent_brand_id: formData.brandId })
        }
      };

      const newNode = await entityApi.create(payload as any);
      
      // Establish formal Graph Edges (Connections)
      if (formData.type === "model" && formData.brandId) {
        await edgeApi.createLink({
          source_id: newNode.id,
          target_id: formData.brandId,
          type: "MADE_BY",
          data: { context: "Manual_Ingest_Hierarchy" }
        });
      } else if (formData.type === "variant" && formData.modelId) {
        await edgeApi.createLink({
          source_id: newNode.id,
          target_id: formData.modelId,
          type: "VARIANT_OF",
          data: { context: "Manual_Ingest_Hierarchy" }
        });
      } else if (formData.type === "release" && formData.variantId) {
        await edgeApi.createLink({
          source_id: newNode.id,
          target_id: formData.variantId,
          type: "VERSION_OF",
          data: { context: "Manual_Ingest_Hierarchy" }
        });
      }
      
      setFormData({
        slug: "",
        type: "brand",
        name_en: "",
        desc_en: "",
        brandId: "",
        modelId: "",
        variantId: "",
        vehicle_type: "4w-ice"
      });
      setStatus({ type: "success", message: "Node successfully committed to the registry." });
    } catch (err: any) {
      console.error("Save failed:", err);
      setStatus({ type: "error", message: err.message || "Failed to persist node to the knowledge graph." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center py-16 px-12 relative">
      <div className="w-full max-w-6xl space-y-16">
        
        {/* Status Message */}
        {status.type && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-3xl flex items-start gap-5 backdrop-blur-xl border ${
              status.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
            }`}
          >
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            <span className="text-sm font-semibold tracking-tight leading-relaxed">{status.message}</span>
          </motion.div>
        )}

        {/* Main Forge Interface */}
        <div className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            
            {/* Left Column (Identity) */}
            <div className="space-y-16">
              {/* Type Selection */}
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] flex items-center gap-3 px-1">
                  1. Node Type
                </label>
                <div className="relative group">
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value, brandId: "", modelId: "", variantId: ""})}
                    className="w-full bg-white/[0.02] border border-white/[0.03] p-8 text-sm font-bold text-slate-100 focus:ring-1 focus:ring-white/20 transition-all rounded-[2rem] cursor-pointer appearance-none hover:bg-white/[0.04]"
                  >
                    <option value="brand" className="bg-[#1a1c23] text-slate-300">Brand / Manufacturer</option>
                    <option value="model" className="bg-[#1a1c23] text-slate-300">Vehicle Model</option>
                    <option value="variant" className="bg-[#1a1c23] text-slate-300">Technical Variant</option>
                    <option value="release" className="bg-[#1a1c23] text-slate-300">Model Year Release</option>
                  </select>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-hover:text-slate-100 transition-colors">
                    <Database className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Vehicle Segment Selection (Conditional) */}
              {formData.type === "model" && (
                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] flex items-center gap-3 px-1">
                    1.5 Vehicle Segment
                  </label>
                  <div className="relative group">
                    <select 
                      value={formData.vehicle_type}
                      onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                      className="w-full bg-white/[0.02] border border-white/[0.03] p-8 text-sm font-bold text-slate-100 focus:ring-1 focus:ring-white/20 transition-all rounded-[2rem] cursor-pointer appearance-none hover:bg-white/[0.04]"
                    >
                      <option value="2w-ice" className="bg-[#1a1c23] text-slate-300">2-Wheeler (ICE)</option>
                      <option value="4w-ice" className="bg-[#1a1c23] text-slate-300">4-Wheeler (ICE)</option>
                      <option value="4w-electric" className="bg-[#1a1c23] text-slate-300">4-Wheeler (Electric)</option>
                    </select>
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-hover:text-slate-100 transition-colors">
                      <Info className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Name Input */}
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] px-1">2. Node Name</label>
                <input 
                  type="text"
                  value={formData.name_en}
                  onChange={handleNameChange}
                  autoComplete="off"
                  className="w-full bg-white/[0.02] border border-white/[0.03] p-8 text-xl font-black text-slate-100 placeholder:text-slate-700 focus:ring-1 focus:ring-white/20 transition-all rounded-[2rem] hover:bg-white/[0.04]"
                  placeholder="e.g. Tesla Motors"
                />
              </div>

              {/* Slug Input */}
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] flex items-center justify-between px-1">
                  3. System Key
                  <span className="text-[9px] font-mono text-slate-600">Immutable Slug</span>
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    className="w-full bg-white/[0.02] border border-white/[0.03] p-8 text-sm font-mono text-slate-100 focus:ring-1 focus:ring-white/20 transition-all rounded-[2rem] hover:bg-white/[0.04]"
                    placeholder="tesla-motors"
                  />
                </div>
              </div>
            </div>

            {/* Right Column (Hierarchy) */}
            <div className="space-y-16 flex flex-col">
              {/* Hierarchical Selection Hub (Brands) */}
              {(formData.type === "model" || formData.type === "variant" || formData.type === "release") && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] flex items-center gap-3 px-1">
                    4. Select Brand
                  </label>

                  <div className="relative bg-white/[0.01] border border-white/[0.02] rounded-[2.5rem] p-8 hover:bg-white/[0.02] transition-all">
                    <div className="flex flex-wrap gap-4 max-h-32 overflow-y-auto px-2 pr-3 custom-scrollbar py-1">
                      {brands.map((brand, idx) => {
                        const isSelected = formData.brandId === brand.id;
                        const displayName = brand.name?.en || brand.name;
                        return (
                          <motion.button
                            key={brand.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.02 }}
                            onClick={() => setFormData(prev => ({ ...prev, brandId: isSelected ? "" : brand.id, modelId: "" }))}
                            className={`relative px-8 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2 ${
                              isSelected 
                                ? "bg-slate-400/30 text-white border-slate-400/50 shadow-xl scale-105" 
                                : "bg-white/5 text-slate-400 border-white/5 hover:border-white/10 hover:text-slate-200"
                            }`}
                          >
                            {displayName}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Hierarchical Selection Hub (Models) */}
              {(formData.type === "variant" || formData.type === "release") && formData.brandId && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] flex items-center gap-3 px-1">
                    5. Select Model
                  </label>
                  <div className="relative bg-white/[0.01] border border-white/[0.02] rounded-[2.5rem] p-8 hover:bg-white/[0.02] transition-all">
                    <div className="flex flex-wrap gap-4 max-h-32 overflow-y-auto px-2 pr-3 custom-scrollbar py-1">
                      {models.length > 0 ? models.map((model, idx) => {
                        const isSelected = formData.modelId === model.id;
                        const displayName = model.name?.en || model.name;
                        return (
                          <motion.button
                            key={model.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.02 }}
                            onClick={() => setFormData(prev => ({ ...prev, modelId: isSelected ? "" : model.id, variantId: "" }))}
                            className={`relative px-8 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2 ${
                              isSelected 
                                ? "bg-slate-400/30 text-white border-slate-400/50 shadow-xl scale-105" 
                                : "bg-white/5 text-slate-400 border-white/5 hover:border-white/10 hover:text-slate-200"
                            }`}
                          >
                            {displayName}
                          </motion.button>
                        );
                      }) : (
                        <div className="w-full py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 text-center italic">
                          No models discovered
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Hierarchical Selection Hub (Variants) */}
              {formData.type === "release" && formData.modelId && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] flex items-center gap-3 px-1">
                    6. Select Variant
                  </label>
                  <div className="relative bg-white/[0.01] border border-white/[0.02] rounded-[2.5rem] p-8 hover:bg-white/[0.02] transition-all">
                    <div className="flex flex-wrap gap-4 max-h-32 overflow-y-auto px-2 pr-3 custom-scrollbar py-1">
                      {variants.length > 0 ? variants.map((variant, idx) => {
                        const isSelected = formData.variantId === variant.id;
                        const displayName = variant.name?.en || variant.name;
                        return (
                          <motion.button
                            key={variant.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.02 }}
                            onClick={() => setFormData(prev => ({ ...prev, variantId: isSelected ? "" : variant.id }))}
                            className={`relative px-8 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2 ${
                              isSelected 
                                ? "bg-slate-400/30 text-white border-slate-400/50 shadow-xl scale-105" 
                                : "bg-white/5 text-slate-400 border-white/5 hover:border-white/10 hover:text-slate-200"
                            }`}
                          >
                            {displayName}
                          </motion.button>
                        );
                      }) : (
                        <div className="w-full py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 text-center italic">
                          No variants discovered
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Description Input */}
              <div className="space-y-6 flex-1 flex flex-col">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] px-1">7. Metadata Context</label>
                <textarea 
                  value={formData.desc_en}
                  onChange={(e) => setFormData({...formData, desc_en: e.target.value})}
                  className="flex-1 w-full bg-white/[0.02] border border-white/[0.03] p-8 text-sm font-medium text-slate-300 placeholder:text-slate-700 focus:ring-1 focus:ring-white/20 transition-all rounded-[2.5rem] resize-none leading-relaxed hover:bg-white/[0.04] min-h-[160px]"
                  placeholder="Technical specifications or operational context..."
                />
              </div>
            </div>
          </div>

          {/* Registry Control Hub */}
          <div className="space-y-12 pt-12">
            <motion.button 
              onClick={handleSave}
              disabled={isSaving || !formData.slug || !formData.name_en || 
                (formData.type === 'model' && !formData.brandId) || 
                (formData.type === 'variant' && (!formData.brandId || !formData.modelId)) ||
                (formData.type === 'release' && (!formData.brandId || !formData.modelId || !formData.variantId))
              }
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-6 py-10 bg-slate-100 text-slate-950 font-black uppercase text-[12px] tracking-[0.5em] hover:bg-slate-200 transition-all rounded-[2.5rem] disabled:opacity-5 disabled:bg-white/10 shadow-2xl relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
              {isSaving ? (
                <>
                  <div className="w-6 h-6 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                  <span>Processing Node...</span>
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  <span>Commit to Registry</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngestPage;
