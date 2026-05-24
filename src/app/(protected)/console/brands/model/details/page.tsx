"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  ChevronLeft, 
  Cpu, 
  Settings2, 
  Zap, 
  Activity,
  Layers,
  Info,
  ExternalLink,
  ChevronRight,
  Database,
  Search,
  RefreshCw,
  Car,
  Tag,
  Gauge,
  Sliders,
  Sparkles,
  Edit3,
  Check,
  Plus,
  Loader2
} from "lucide-react";
import { graphClient, EntityNode, TypeBlueprint } from "@lib/core";

const getModelValue = (model: any, fieldKey: string, fieldConfig: any) => {
  if (!model?.data) return undefined;
  
  if (model.data[fieldKey] !== undefined) {
    return model.data[fieldKey];
  }
  
  const specs = model.data.specifications;
  if (!specs) return undefined;
  
  const label = fieldConfig.label;
  if (label) {
    const cleanedLabel = label.toLowerCase();
    for (const k of Object.keys(specs)) {
      if (k.toLowerCase() === cleanedLabel) {
        return specs[k];
      }
    }
  }
  
  return undefined;
};

const formatValue = (val: any) => {
  if (val === null || val === undefined) return undefined;
  if (typeof val === 'object') {
    if (val.value !== undefined) {
      return val.value;
    }
  }
  return val;
};

const KEY_SPECS = {
  engine_type: { label: "Engine Type", type: "string" },
  displacement: { label: "Displacement", type: "number", unit: "cc" },
  max_power: { label: "Max Power", type: "string" },
  max_torque: { label: "Max Torque", type: "string" },
  transmission_type: { label: "Transmission Type", type: "string" },
  fuel_type: { label: "Fuel Type", type: "string" },
  seating_capacity: { label: "Seating Capacity", type: "number" },
  length: { label: "Length", type: "number", unit: "mm" },
  width: { label: "Width", type: "number", unit: "mm" },
  height: { label: "Height", type: "number", unit: "mm" },
  ground_clearance: { label: "Ground Clearance Unladen", type: "number", unit: "mm" }
};

const ModelDetailsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modelId = searchParams.get("modelId");

  const [model, setModel] = useState<EntityNode | null>(null);
  const [brand, setBrand] = useState<EntityNode | null>(null);
  const [variants, setVariants] = useState<EntityNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [availableNodes, setAvailableNodes] = useState<EntityNode[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [attributeSearchTerm, setAttributeSearchTerm] = useState("");

  const loadData = async () => {
    if (!modelId) return;
    setIsLoading(true);
    try {
      // 1. Fetch Model Node
      const modelRes = await graphClient.getNode({ id: modelId, slug: "" });
      if (!modelRes.node) throw new Error("Model not found");

      const mappedModel: EntityNode = {
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
      };
      setModel(mappedModel);

      // 2. Fetch Brand Node (linked via incoming/outgoing has_model)
      const brandNeighbors = await graphClient.getNeighbors({
        nodeId: modelId,
        linkTypes: ["has_model"]
      });
      const brandNode = (brandNeighbors.nodes || []).find(n => n.type === "brand");
      if (brandNode) {
        setBrand({
          id: brandNode.id,
          type: brandNode.type,
          slug: brandNode.slug,
          name: brandNode.name || {},
          description: brandNode.description || {},
          tags: brandNode.tags || [],
          metadata: brandNode.metadata || {},
          data: brandNode.data || {},
          created_at: "",
          updated_at: brandNode.updatedAt
        });
      }

      // 3. Fetch Variants Node (linked via has_variant)
      const variantNeighbors = await graphClient.getNeighbors({
        nodeId: modelId,
        linkTypes: ["has_variant"]
      });
      const mappedVariants: EntityNode[] = (variantNeighbors.nodes || [])
        .filter(n => n.type === "variant")
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
      setVariants(mappedVariants);
    } catch (err) {
      console.error("Failed to load model details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [modelId]);

  const handleEditClick = async (field: string) => {
    setEditingField(field);
    setAvailableNodes([]);
    try {
      const dbFieldType = field.replace(/_/g, "-");
      const res = await graphClient.searchNodes({
        query: "",
        types: [dbFieldType],
        limit: 1000,
        vector: []
      });
      const mapped = (res.nodes || []).map(n => ({
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
      setAvailableNodes(mapped);
    } catch (err) {
      console.error("Failed to fetch attribute nodes:", err);
    }
  };

  const handleSaveEdit = async (field: string, node: EntityNode) => {
    if (!model) return;
    setIsUpdating(true);
    try {
      const updatedData = { ...model.data };
      if (!updatedData.specifications) updatedData.specifications = {};
      
      const valueToSave = node.data?.value !== undefined ? node.data.value : node.name.en;
      
      const fieldConfig = KEY_SPECS[field as keyof typeof KEY_SPECS];
      let targetKey = fieldConfig?.label || field.replace(/_/g, " ");
      const cleanedKey = targetKey.toLowerCase();
      for (const k of Object.keys(updatedData.specifications)) {
        if (k.toLowerCase() === cleanedKey) {
          targetKey = k;
          break;
        }
      }

      const oldVal = updatedData.specifications[targetKey];
      if (oldVal && typeof oldVal === 'object' && oldVal.unit !== undefined) {
        updatedData.specifications[targetKey] = {
          value: valueToSave,
          unit: oldVal.unit
        };
      } else {
        updatedData.specifications[targetKey] = valueToSave;
      }

      await graphClient.updateNode({
        id: model.id,
        name: model.name,
        description: model.description,
        tags: model.tags,
        metadata: model.metadata,
        data: updatedData,
        embedding: []
      });

      setModel({ ...model, data: updatedData });
      setEditingField(null);
    } catch (err) {
      console.error("Failed to update attribute:", err);
      alert("Failed to save change.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleBoolean = async (field: string, currentValue: any) => {
    if (!model || isUpdating) return;
    setIsUpdating(true);
    try {
      const isCurrentlyTrue = currentValue === true || currentValue === "Yes" || currentValue === "true";
      const targetValue = !isCurrentlyTrue;

      if (targetValue === true) {
        const dbFieldType = field.replace(/_/g, "-");
        const targetSlug = `${dbFieldType}-yes`;
        const existingNodesRes = await graphClient.searchNodes({
          query: "",
          types: [dbFieldType],
          limit: 100,
          vector: []
        });
        const matchingNode = (existingNodesRes.nodes || []).find(n => n.slug === targetSlug);

        if (!matchingNode) {
          await graphClient.createNode({
            type: dbFieldType,
            slug: targetSlug,
            name: { en: "Yes" },
            description: {},
            tags: [dbFieldType],
            metadata: {},
            data: { value: true },
            embedding: []
          });
        }
      }

      const updatedData = { ...model.data };
      if (!updatedData.specifications) updatedData.specifications = {};
      
      const fieldConfig = KEY_SPECS[field as keyof typeof KEY_SPECS];
      let targetKey = fieldConfig?.label || field.replace(/_/g, " ");
      const cleanedKey = targetKey.toLowerCase();
      for (const k of Object.keys(updatedData.specifications)) {
        if (k.toLowerCase() === cleanedKey) {
          targetKey = k;
          break;
        }
      }

      updatedData.specifications[targetKey] = targetValue;

      await graphClient.updateNode({
        id: model.id,
        name: model.name,
        description: model.description,
        tags: model.tags,
        metadata: model.metadata,
        data: updatedData,
        embedding: []
      });

      setModel({ ...model, data: updatedData });
    } catch (err) {
      console.error("Failed to toggle boolean attribute:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickCreate = async (field: string, type: string) => {
    if (!attributeSearchTerm.trim() || !model) return;
    setIsUpdating(true);
    try {
      const dbFieldType = field.replace(/_/g, "-");
      const name = attributeSearchTerm.trim();
      const randomSuffix = Math.random().toString(36).substring(7);
      const slug = `${dbFieldType}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${randomSuffix}`;
      
      const data: any = {};
      if (type === 'number') {
        const num = parseFloat(name);
        if (!isNaN(num)) data.value = num;
      }

      const res = await graphClient.createNode({
        type: dbFieldType,
        slug,
        name: { en: name },
        description: {},
        tags: [dbFieldType],
        metadata: {},
        data,
        embedding: []
      });

      if (!res.node) throw new Error("Failed to create node");

      const newNode: EntityNode = {
        id: res.node.id,
        type: res.node.type,
        slug: res.node.slug,
        name: res.node.name || {},
        description: res.node.description || {},
        tags: res.node.tags || [],
        metadata: res.node.metadata || {},
        data: res.node.data || {},
        created_at: "",
        updated_at: res.node.updatedAt
      };

      await handleSaveEdit(field, newNode);
      setAttributeSearchTerm("");
    } catch (err) {
      console.error("Failed to quick create node:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <RefreshCw className="w-12 h-12 text-slate-700 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Decrypting Model Spec Graph</p>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-slate-950">
        <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">Model Discovery Failed</p>
      </div>
    );
  }

  const modelName = typeof model.name === 'object' ? (model.name as any).en : model.name;
  const brandName = brand ? (typeof brand.name === 'object' ? (brand.name as any).en : brand.name) : "Global";

  const specs = model.data?.specifications || {};
  const features: string[] = model.data?.features || [];

  return (
    <div className="flex-1 flex flex-col items-center py-12 px-8 lg:px-16 min-h-screen">
      <div className="w-full max-w-7xl space-y-12">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/[0.03] pb-12">
          <div className="space-y-6">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Return to Models</span>
            </button>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-teal-400 font-black text-sm uppercase tracking-[0.3em]">{brandName}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <span className="text-slate-500 text-xs font-bold font-mono">{model.slug}</span>
              </div>
              <h1 className="text-5xl font-black text-white tracking-tight leading-none">
                {modelName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative w-64">
              <input 
                type="text"
                placeholder="Search specs..."
                value={attributeSearchTerm}
                onChange={(e) => setAttributeSearchTerm(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white focus:ring-1 focus:ring-white/20 transition-all hover:bg-white/[0.05]"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
            </div>

            <button 
              onClick={loadData}
              className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Sync</span>
            </button>
          </div>
        </div>

        {/* Specifications & Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Specifications Box */}
          <div className="lg:col-span-2 bg-slate-950/40 border border-white/[0.03] p-8 rounded-[2.5rem] space-y-8 backdrop-blur-md">
            <div className="flex items-center gap-3 text-slate-200 border-b border-white/5 pb-6">
              <Sliders className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-black uppercase tracking-wider">Key Specifications</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {Object.entries(KEY_SPECS)
                .filter(([fieldKey, fieldConfig]) => {
                  const label = (fieldConfig.label || fieldKey.replace(/_/g, " ")).toLowerCase();
                  return label.includes(attributeSearchTerm.toLowerCase());
                })
                .map(([fieldKey, fieldConfig]) => {
                  const rawValue = getModelValue(model, fieldKey, fieldConfig);
                  const value = formatValue(rawValue);
                  return (
                    <div key={fieldKey} className="group bg-white/[0.01] border border-white/[0.03] p-5 rounded-2xl hover:bg-white/[0.02] transition-all hover:border-white/10 flex items-center justify-between gap-4 relative overflow-hidden">
                      {editingField === fieldKey ? (
                        <div className="flex-1 flex flex-col gap-4 relative z-10">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">
                              Editing {fieldConfig.label || fieldKey.replace(/_/g, " ")}
                            </p>
                            <button 
                              onClick={() => setEditingField(null)}
                              className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                          
                          <div className="relative">
                            <input 
                              type="text"
                              autoFocus
                              placeholder="Search nodes..."
                              value={attributeSearchTerm}
                              onChange={(e) => setAttributeSearchTerm(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-xs text-white focus:ring-1 focus:ring-white/20 transition-all"
                            />
                            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                          </div>

                          <div className="max-h-40 overflow-y-auto custom-scrollbar flex flex-col gap-1 p-1">
                            {attributeSearchTerm.trim() && (
                              <button 
                                onClick={() => handleQuickCreate(fieldKey, fieldConfig.type)}
                                className="text-left px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-bold transition-all flex items-center justify-between group/create"
                              >
                                <div className="flex flex-col">
                                  <span className="text-[10px] uppercase font-black tracking-widest">Create New Node</span>
                                  <span className="text-[11px] opacity-80">"{attributeSearchTerm}"</span>
                                </div>
                                <Plus className="w-4 h-4 group-hover/create:rotate-90 transition-transform" />
                              </button>
                            )}

                            {availableNodes
                              .filter(node => {
                                const name = typeof node.name === 'object' ? node.name.en : node.name;
                                return name.toLowerCase().includes(attributeSearchTerm.toLowerCase());
                              })
                              .length > 0 ? (
                              availableNodes
                                .filter(node => {
                                  const name = typeof node.name === 'object' ? node.name.en : node.name;
                                  return name.toLowerCase().includes(attributeSearchTerm.toLowerCase());
                                })
                                .map(node => (
                                  <button
                                    key={node.id}
                                    onClick={() => {
                                      handleSaveEdit(fieldKey, node);
                                      setAttributeSearchTerm("");
                                    }}
                                    disabled={isUpdating}
                                    className="text-left px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group/opt"
                                  >
                                    <span>{typeof node.name === 'object' ? node.name.en : node.name}</span>
                                    <Check className="w-3 h-3 opacity-0 group-hover/opt:opacity-100 transition-opacity text-emerald-500" />
                                  </button>
                                ))
                            ) : !attributeSearchTerm.trim() && (
                              <div className="flex flex-col items-center gap-3 py-4">
                                <p className="text-[10px] text-slate-600 uppercase font-black text-center">No nodes found in registry</p>
                              </div>
                            )}
                          </div>
                          {isUpdating && (
                            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 space-y-2">
                            <p className="text-[9px] font-black text-slate-500 tracking-[0.15em] uppercase">
                              {fieldConfig.label || fieldKey.replace(/_/g, " ")}
                            </p>
                            <div className="flex items-baseline gap-1.5">
                              <p className="text-base font-black text-white group-hover:text-teal-400 transition-colors">
                                {fieldConfig.type === 'boolean' 
                                  ? (value === true || value === "Yes" || value === "true" ? "Yes" : "No")
                                  : (value !== undefined ? value : "---")
                                }
                              </p>
                              {(fieldConfig as any).unit && value !== undefined && (
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                  {(fieldConfig as any).unit}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end justify-between self-stretch py-0.5">
                            <div className="flex items-center gap-1.5">
                              {fieldConfig.type === "string" && (
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-teal-300/80">String</span>
                              )}
                              {fieldConfig.type === "number" && (
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-300/80">Number</span>
                              )}
                              {fieldConfig.type === "boolean" && (
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-300/80">Boolean</span>
                              )}
                            </div>

                            <div className="pt-2">
                              {fieldConfig.type === 'boolean' ? (
                                <button 
                                  onClick={() => handleToggleBoolean(fieldKey, value)}
                                  disabled={isUpdating}
                                  className={`relative w-8 h-4 rounded-full transition-all duration-300 ${
                                    (value === true || value === "Yes" || value === "true") 
                                      ? 'bg-emerald-500/20 border-emerald-500/30' 
                                      : 'bg-white/5 border-white/10'
                                  } border flex items-center p-0.5 hover:scale-105`}
                                >
                                  <motion.div 
                                    animate={{ 
                                      x: (value === true || value === "Yes" || value === "true") ? 14 : 0,
                                      backgroundColor: (value === true || value === "Yes" || value === "true") ? '#10b981' : '#475569'
                                    }}
                                    className="w-2.5 h-2.5 rounded-full shadow-lg"
                                  />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleEditClick(fieldKey)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-500 hover:text-white transition-all"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Features Column */}
          <div className="bg-slate-950/40 border border-white/[0.03] p-8 rounded-[2.5rem] space-y-8 backdrop-blur-md flex flex-col">
            <div className="flex items-center gap-3 text-slate-200">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-black uppercase tracking-wider">Key Features</h2>
            </div>

            {features.length > 0 ? (
              <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[350px] pr-2">
                {features.map((feature, i) => (
                  <span 
                    key={i}
                    className="px-3.5 py-2 bg-white/5 border border-white/5 hover:border-teal-500/20 text-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No key features list mapped to this model node.</p>
            )}
          </div>
        </div>

        {/* Variants List Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 text-slate-200">
            <Layers className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-black uppercase tracking-wider">Linked Variants ({variants.length})</h2>
          </div>

          {variants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {variants.map((variant, idx) => {
                const varName = typeof variant.name === 'object' ? (variant.name as any).en : variant.name;
                const specData = variant.data?.specifications || {};
                
                return (
                  <motion.div
                    key={variant.id}
                    whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.02)" }}
                    onClick={() => router.push(`/console/brands/model/details/variant?variantId=${variant.id}`)}
                    className="group cursor-pointer bg-white/[0.01] border border-white/[0.03] hover:border-white/10 p-6 rounded-[2rem] transition-all flex flex-col justify-between h-48 relative shadow-lg"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-black uppercase tracking-tighter bg-white/5 border border-white/5 px-2.5 py-1 rounded-full text-slate-500">
                          {variant.slug}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-lg font-black text-white group-hover:text-teal-400 transition-colors leading-tight">
                        {varName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-wider pt-4 border-t border-white/5">
                      <span>{specData["Fuel Type"] || "Fuel N/A"}</span>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span>{specData["Transmission Type"] || "Trans N/A"}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 border border-dashed border-white/5 rounded-[2rem] text-center">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No variants mapped to this model graph node yet</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const ModelDetailsPageWithSuspense = () => (
  <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-screen text-slate-400">Loading Model Details...</div>}>
    <ModelDetailsPage />
  </Suspense>
);

export default ModelDetailsPageWithSuspense;
