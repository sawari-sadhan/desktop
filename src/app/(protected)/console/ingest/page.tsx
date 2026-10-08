"use client";

import React, { useState } from "react";
import { Save, CheckCircle2, AlertCircle, Database, Layers, Car, Bike } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { graphClient } from "@lib/core";
import { WheelOptionSwitcher } from "@/app/(public)/components/ui/switcher/wheel-option";

const IngestPage = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" });
  const [hasSelectedType, setHasSelectedType] = useState(false);
  const [globalVehicleType, setGlobalVehicleType] = useState<"4w" | "2w">("4w");
  const [brands, setBrands] = useState<{id: string, name: any, slug: string}[]>([]);
  const [models, setModels] = useState<{id: string, name: any, slug: string, parent_brand_id?: string}[]>([]);
  const [formData, setFormData] = useState({
    slug: "",
    type: "brand",
    name_en: "",
    desc_en: "",
    brandId: "",
    modelId: ""
  });

  // Initial load of brands
  React.useEffect(() => {
    const loadBrands = async () => {
      try {
        const res = await graphClient.searchNodes({ query: "", types: ["brand"], limit: 1000 });
        setBrands((res.nodes || []).map(b => ({ id: b.id, name: b.name, slug: b.slug })));
      } catch (err) {
        console.error("Failed to load brands:", err);
      }
    };
    loadBrands();
  }, []);

  // Fetch models whenever a brand is selected
  React.useEffect(() => {
    if ((formData.type === "variant" || formData.type === "model") && formData.brandId) {
      const loadModels = async () => {
        try {
          const res = await graphClient.searchNodes({ query: "", types: ["model"], limit: 1000 });
          const filtered = (res.nodes || [])
            .filter(m => (m.data as any)?.parent_brand_id === formData.brandId)
            .map(m => ({ id: m.id, name: m.name, slug: m.slug }));
          setModels(filtered);
        } catch (err) {
          console.error("Failed to load models:", err);
        }
      };
      loadModels();
    }
  }, [formData.brandId, formData.type]);

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

  const slugify = (text: string) => {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
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

    setIsSaving(true);
    setStatus({ type: null, message: "" });

    try {
      const res = await graphClient.createNode({
        type: formData.type,
        slug: formData.slug,
        name: { en: formData.name_en } as any,
        description: { en: formData.desc_en } as any,
        tags: formData.type === "model" ? [formData.type, globalVehicleType] : [formData.type],
        metadata: { ...(formData.type === "model" && { vehicleType: globalVehicleType }) } as any,
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
          sourceId: newNode.id,
          targetId: formData.brandId,
          linkType: "MADE_BY",
          metadata: { context: "Manual_Ingest_Hierarchy" } as any
        });
      } else if (formData.type === "variant" && formData.modelId) {
        await graphClient.addLink({
          sourceId: newNode.id,
          targetId: formData.modelId,
          linkType: "VARIANT_OF",
          metadata: { context: "Manual_Ingest_Hierarchy" } as any
        });
      }
      
      setFormData({ slug: "", type: "brand", name_en: "", desc_en: "", brandId: "", modelId: "" });
      setStatus({ type: "success", message: "Node successfully committed to the registry." });
    } catch (err: any) {
      console.error("Save failed:", err);
      setStatus({ type: "error", message: err.message || "Failed to persist node to the knowledge graph." });
    } finally {
      setIsSaving(false);
    }
  };

  if (!hasSelectedType) {
    return (
      <div className="flex-1 h-full w-full bg-slate-50/80 relative overflow-hidden flex flex-col items-center justify-center p-4 font-sans selection:bg-teal-500/20">
        <div className="w-full max-w-3xl relative z-10 flex flex-col items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            <button
              onClick={() => { setGlobalVehicleType("4w"); setHasSelectedType(true); }}
              className="flex flex-col items-center justify-center p-12 sm:p-16 bg-white border border-slate-200/60 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all group"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300 text-slate-600">
                <Car className="w-8 h-8" />
              </div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.25em]">4 Wheel</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-3">Cars, SUVs, Vans</p>
            </button>

            <button
              onClick={() => { setGlobalVehicleType("2w"); setHasSelectedType(true); }}
              className="flex flex-col items-center justify-center p-12 sm:p-16 bg-white border border-slate-200/60 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all group"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300 text-slate-600">
                <Bike className="w-8 h-8" />
              </div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.25em]">2 Wheel</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-3">Motorcycles, Scooters</p>
            </button>
          </div>
          
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full w-full bg-slate-50/80 relative overflow-y-auto flex flex-col items-center py-10 px-4 sm:px-12 font-sans selection:bg-teal-500/20">
      
      <div className="w-full max-w-[1400px] relative z-10 space-y-10">
        
        {/* Header matching original theme */}
        <div className="w-full flex items-center justify-center pb-6 border-b border-slate-200">
          <WheelOptionSwitcher 
            value={globalVehicleType} 
            onChange={setGlobalVehicleType} 
            size="lg"
          />
        </div>

        {/* Status Message */}
        <AnimatePresence>
          {status.type && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={`p-5 rounded-2xl flex items-start gap-4 backdrop-blur-xl border ${
                status.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span className="text-xs font-bold tracking-tight leading-relaxed">{status.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Forge Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column (Identity) */}
          <div className="bg-white border border-slate-200/60 p-8 sm:p-10 rounded-[2.5rem] space-y-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.25em] border-l-2 border-teal-500/40 pl-4 flex items-center gap-3">
              Node Identity
            </h2>

            <div className="space-y-8 pt-2 flex-1 flex flex-col">
              {/* Type Selection */}
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] px-1 block">
                  1. Node Type
                </label>
                <div className="relative group">
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value, brandId: "", modelId: ""})}
                    className="w-full bg-slate-50/50 border border-slate-200 p-4.5 py-4 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all rounded-2xl appearance-none cursor-pointer outline-none hover:bg-slate-50 hover:border-slate-300"
                  >
                    <option value="brand" className="font-medium">Brand / Manufacturer</option>
                    <option value="model" className="font-medium">Vehicle Model</option>
                    <option value="variant" className="font-medium">Technical Variant</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] px-1 block">
                  2. Node Name
                </label>
                <input 
                  type="text"
                  value={formData.name_en}
                  onChange={handleNameChange}
                  autoComplete="off"
                  className="w-full bg-slate-50/50 border border-slate-200 p-4.5 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10 transition-all rounded-2xl outline-none hover:bg-slate-50 hover:border-slate-300"
                  placeholder="e.g. Tesla Motors"
                />
              </div>

              <div className="flex-1" />
            </div>
          </div>

          {/* Right Column (Hierarchy) */}
          <div className="bg-white border border-slate-200/60 p-8 sm:p-10 rounded-[2.5rem] space-y-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.25em] border-l-2 border-teal-500/40 pl-4">
              Hierarchy & Context
            </h2>

            <div className="space-y-8 pt-2 flex-1 flex flex-col">
              
              {/* Brand Selection */}
              <AnimatePresence mode="wait">
                {(formData.type === "model" || formData.type === "variant") && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-3">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] px-1 block">
                      3. Select Brand
                    </label>
                    <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-3">
                      <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto px-1 custom-scrollbar">
                        {brands.map((brand) => {
                          const isSelected = formData.brandId === brand.id;
                          return (
                            <button
                              key={brand.id}
                              onClick={() => setFormData(prev => ({ ...prev, brandId: isSelected ? "" : brand.id, modelId: "" }))}
                              className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-200 border ${
                                isSelected 
                                  ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900 shadow-sm"
                              }`}
                            >
                              {brand.name?.en || brand.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Model Selection */}
              <AnimatePresence mode="wait">
                {formData.type === "variant" && formData.brandId && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-3">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] px-1 block">
                      4. Select Model
                    </label>
                    <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-3">
                      <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto px-1 custom-scrollbar">
                        {models.length > 0 ? models.map((model) => {
                          const isSelected = formData.modelId === model.id;
                          return (
                            <button
                              key={model.id}
                              onClick={() => setFormData(prev => ({ ...prev, modelId: isSelected ? "" : model.id }))}
                              className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-200 border ${
                                isSelected 
                                  ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900 shadow-sm"
                              }`}
                            >
                              {model.name?.en || model.name}
                            </button>
                          );
                        }) : (
                          <div className="w-full py-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">No models discovered</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Description Input */}
              <div className="space-y-3 flex-1 flex flex-col">
                <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] px-1 block">
                  {formData.type === "brand" ? "3." : formData.type === "model" ? "4." : "5."} Metadata Context
                </label>
                <textarea 
                  value={formData.desc_en}
                  onChange={(e) => setFormData({...formData, desc_en: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 p-5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10 transition-all rounded-2xl resize-none outline-none hover:bg-slate-50 hover:border-slate-300 flex-1 min-h-[120px] leading-relaxed"
                  placeholder="Technical specifications or operational context..."
                />
              </div>
            </div>

            {/* Registry Control Hub */}
            <div className="pt-2 w-full mt-auto">
              <button 
                onClick={handleSave}
                disabled={isSaving || !formData.slug || !formData.name_en || (formData.type === 'model' && !formData.brandId) || (formData.type === 'variant' && (!formData.brandId || !formData.modelId))}
                className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all rounded-2xl disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.18)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-400/20 border-t-white rounded-full animate-spin" />
                    <span>Processing Node...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Commit to Registry</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default IngestPage;
