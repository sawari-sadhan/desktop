"use client";

import React, { useState } from "react";
import { Save, Database, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { graphClient } from "@lib/core";

const IngestPage = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" });
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
        const res = await graphClient.searchNodes({
          query: "",
          types: ["brand"],
          limit: 1000
        });
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
          const res = await graphClient.searchNodes({
            query: "",
            types: ["model"],
            limit: 1000
          });
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

    setIsSaving(true);
    setStatus({ type: null, message: "" });

    try {
      const res = await graphClient.createNode({
        type: formData.type,
        slug: formData.slug,
        name: { en: formData.name_en } as any,
        description: { en: formData.desc_en } as any,
        tags: [formData.type],
        metadata: {} as any,
        data: { 
          icon: formData.type, 
          source: "Manual_Ingest",
          ...(formData.type === "model" && { parent_brand_id: formData.brandId }),
          ...(formData.type === "variant" && { parent_model_id: formData.modelId, parent_brand_id: formData.brandId })
        } as any
      });

      const newNode = res.node;
      if (!newNode) throw new Error("Failed to create node: response was empty");
      
      // Establish formal Graph Edges (Connections)
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
      
      setFormData({
        slug: "",
        type: "brand",
        name_en: "",
        desc_en: "",
        brandId: "",
        modelId: ""
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
    <div className="flex-1 p-12 min-h-screen bg-slate-50">
      <div className="w-full space-y-8">
        
        {/* Unified Console Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-8 gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Node <span className="text-slate-500 text-xl ml-2 font-bold tracking-widest uppercase">Ingestion</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Add new nodes to the automotive knowledge graph</p>
          </div>
        </div>

        {/* Status Message */}
        {status.type && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
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

        {/* Main Forge Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column (Identity) */}
          <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] space-y-8 backdrop-blur-md shadow-sm">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.25em] border-l-2 border-teal-500/30 pl-4">
              Node Identity
            </h2>

            {/* Type Selection */}
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] px-1">
                1. Node Type
              </label>
              <div className="relative group">
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value, brandId: "", modelId: ""})}
                  className="w-full bg-white border border-slate-200 p-4 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-slate-200 transition-all rounded-2xl cursor-pointer hover:bg-slate-50 focus:bg-white"
                >
                  <option value="brand" className="bg-white text-slate-900">Brand / Manufacturer</option>
                  <option value="model" className="bg-white text-slate-900">Vehicle Model</option>
                  <option value="variant" className="bg-white text-slate-900">Technical Variant</option>
                </select>
              </div>
            </div>



            {/* Name Input */}
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] px-1">
                2. Node Name
              </label>
              <input 
                type="text"
                value={formData.name_en}
                onChange={handleNameChange}
                autoComplete="off"
                className="w-full bg-white border border-slate-200 p-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-slate-200 transition-all rounded-2xl hover:bg-slate-50 focus:bg-white"
                placeholder="e.g. Tesla Motors"
              />
            </div>

            {/* Slug Input */}
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] flex items-center justify-between px-1">
                3. System Key
                <span className="text-[8px] font-mono text-slate-600">Immutable Slug</span>
              </label>
              <input 
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                className="w-full bg-white border border-slate-200 p-4 text-xs font-mono text-slate-600 focus:ring-1 focus:ring-slate-200 transition-all rounded-2xl hover:bg-slate-50 focus:bg-white"
                placeholder="tesla-motors"
              />
            </div>
          </div>

          {/* Right Column (Hierarchy) */}
          <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] space-y-8 backdrop-blur-md flex flex-col justify-between shadow-sm">
            <div className="space-y-8">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.25em] border-l-2 border-teal-500/30 pl-4">
                Hierarchy & Context
              </h2>

              {/* Hierarchical Selection Hub (Brands) */}
              {(formData.type === "model" || formData.type === "variant") && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-3"
                >
                  <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] px-1">
                    4. Select Brand
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl px-5 py-2 transition-all">
                    <div className="flex flex-wrap gap-2.5 max-h-32 overflow-y-auto px-1 pr-2 custom-scrollbar py-1 my-4">
                      {brands.map((brand, idx) => {
                        const isSelected = formData.brandId === brand.id;
                        const displayName = brand.name?.en || brand.name;
                        return (
                          <motion.button
                            key={brand.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.01 }}
                            onClick={() => setFormData(prev => ({ ...prev, brandId: isSelected ? "" : brand.id, modelId: "" }))}
                            className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-300 border ${
                              isSelected 
                                ? "bg-teal-50 text-teal-700 border-teal-200 shadow-lg scale-105" 
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:shadow-sm"
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
              {formData.type === "variant" && formData.brandId && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-3"
                >
                  <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] px-1">
                    5. Select Model
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl px-5 py-2 transition-all">
                    <div className="flex flex-wrap gap-2.5 max-h-32 overflow-y-auto px-1 pr-2 custom-scrollbar py-1 my-4">
                      {models.length > 0 ? models.map((model, idx) => {
                        const isSelected = formData.modelId === model.id;
                        const displayName = model.name?.en || model.name;
                        return (
                          <motion.button
                            key={model.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.01 }}
                            onClick={() => setFormData(prev => ({ ...prev, modelId: isSelected ? "" : model.id }))}
                            className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-300 border ${
                              isSelected 
                                ? "bg-teal-50 text-teal-700 border-teal-200 shadow-lg scale-105" 
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:shadow-sm"
                            }`}
                          >
                            {displayName}
                          </motion.button>
                        );
                      }) : (
                        <div className="w-full py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 text-center italic">
                          No models discovered
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Description Input */}
              <div className="space-y-3 flex-1 flex flex-col">
                <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] px-1">
                  6. Metadata Context
                </label>
                <textarea 
                  value={formData.desc_en}
                  onChange={(e) => setFormData({...formData, desc_en: e.target.value})}
                  className="w-full bg-white border border-slate-200 p-5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-slate-200 transition-all rounded-2xl resize-none leading-relaxed hover:bg-slate-50 focus:bg-white min-h-[120px]"
                  placeholder="Technical specifications or operational context..."
                />
              </div>
            </div>

            {/* Registry Control Hub */}
            <div className="pt-6 w-full">
              <motion.button 
                onClick={handleSave}
                disabled={isSaving || !formData.slug || !formData.name_en || 
                  (formData.type === 'model' && !formData.brandId) || 
                  (formData.type === 'variant' && (!formData.brandId || !formData.modelId))
                }
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all rounded-2xl disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 shadow-2xl relative overflow-hidden group/btn cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
                    <span>Processing Node...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Commit to Registry</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default IngestPage;
