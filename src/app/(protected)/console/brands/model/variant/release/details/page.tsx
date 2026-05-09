"use client";

import React, { useState, useEffect } from "react";
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
  Edit3,
  Check,
  X,
  Loader2,
  Search,
  RefreshCw,
  Plus
} from "lucide-react";
import { entityApi, EntityNode } from "$lib/v1/graph/entity";
import { typesApi, TypeBlueprint } from "$lib/v1/graph/types/index";

const ReleaseDetailsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const releaseId = searchParams.get("releaseId");

  const [release, setRelease] = useState<EntityNode | null>(null);
  const [model, setModel] = useState<EntityNode | null>(null);
  const [variant, setVariant] = useState<EntityNode | null>(null);
  const [brand, setBrand] = useState<EntityNode | null>(null);
  const [blueprint, setBlueprint] = useState<TypeBlueprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingField, setEditingField] = useState<{ section: string; field: string } | null>(null);
  const [availableNodes, setAvailableNodes] = useState<EntityNode[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [attributeSearchTerm, setAttributeSearchTerm] = useState("");

  const loadData = async () => {
    if (!releaseId) return;
    setIsLoading(true);
    try {
      // 1. Fetch Release
      const allReleases = await entityApi.listByType('release');
      const currentRelease = allReleases.find(r => r.id === releaseId);
      if (!currentRelease) throw new Error("Release not found");
      setRelease(currentRelease);

      // 2. Fetch Variant
      const variantId = currentRelease.data?.parent_variant_id;
      if (variantId) {
        const allVariants = await entityApi.listByType('variant');
        const currentVariant = allVariants.find(v => v.id === variantId);
        setVariant(currentVariant || null);
      }

      // 3. Fetch Model
      const modelId = currentRelease.data?.parent_model_id;
      if (modelId) {
        const allModels = await entityApi.listByType('model');
        const currentModel = allModels.find(m => m.id === modelId);
        setModel(currentModel || null);

        // 4. Fetch Brand
        const brandId = currentModel?.data?.parent_brand_id;
        if (brandId) {
          const allBrands = await entityApi.listByType('brand');
          const currentBrand = allBrands.find(b => b.id === brandId);
          setBrand(currentBrand || null);
        }

        // 5. Fetch Blueprint based on model's vehicle_type
        const vType = currentModel?.data?.vehicle_type;
        if (vType) {
          const bp = await typesApi.getBlueprint(vType);
          setBlueprint(bp);
        }
      }
    } catch (err) {
      console.error("Failed to load release details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [releaseId]);

  const handleEditClick = async (section: string, field: string) => {
    setEditingField({ section, field });
    setAvailableNodes([]);
    try {
      // Fetch nodes from the attribute registry (the field code is the type)
      const data = await entityApi.listByType(field);
      setAvailableNodes(data);
    } catch (err) {
      console.error("Failed to fetch attribute nodes:", err);
    }
  };

  const handleSaveEdit = async (section: string, field: string, node: EntityNode) => {
    if (!release) return;
    setIsUpdating(true);
    try {
      const updatedData = { ...release.data };
      if (!updatedData[section]) updatedData[section] = {};
      
      // Use the raw value for numeric nodes, otherwise the display name
      const valueToSave = node.data?.value !== undefined ? node.data.value : node.name.en;
      updatedData[section][field] = valueToSave;

      await entityApi.update(release.id, {
        data: updatedData
      });

      // Update local state
      setRelease({ ...release, data: updatedData });
      setEditingField(null);
    } catch (err) {
      console.error("Failed to update attribute:", err);
      alert("Failed to save change.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleBoolean = async (section: string, field: string, currentValue: any) => {
    if (!release || isUpdating) return;
    setIsUpdating(true);
    try {
      const isCurrentlyTrue = currentValue === true || currentValue === "Yes" || currentValue === "true";
      const targetValue = !isCurrentlyTrue;

      // In our Single-Node Architecture, the 'link' is represented by the 'true' state in JSONB.
      // The BooleanEditor discovers these links by scanning the release data.
      if (targetValue === true) {
        // Ensure the attribute node exists in the registry
        const existingNodes = await entityApi.listByType(field);
        const matchingNode = existingNodes.find(n => n.slug === field);

        if (!matchingNode) {
          await entityApi.create({
            type: field,
            slug: field, // Slug matches the code exactly
            name: { en: "Yes" },
            data: { value: true }
          });
        }
      }

      // Update the release data - this effectively 'adds' or 'removes' the logical link
      const updatedData = { ...release.data };
      if (!updatedData[section]) updatedData[section] = {};
      updatedData[section][field] = targetValue;

      await entityApi.update(release.id, {
        data: updatedData
      });

      setRelease({ ...release, data: updatedData });
    } catch (err) {
      console.error("Failed to toggle boolean:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickCreate = async (section: string, field: string, type: string) => {
    if (!attributeSearchTerm.trim() || !release) return;
    setIsUpdating(true);
    try {
      const name = attributeSearchTerm.trim();
      // Generate a reasonably unique slug
      const randomSuffix = Math.random().toString(36).substring(7);
      const slug = `${field}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${randomSuffix}`;
      
      const data: any = {};
      if (type === 'number') {
        const num = parseFloat(name);
        if (!isNaN(num)) data.value = num;
      }

      const newNode = await entityApi.create({
        type: field,
        slug,
        name: { en: name },
        data
      });

      // After creation, immediately save this as the release's value
      await handleSaveEdit(section, field, newNode);
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
          <RefreshCwIcon className="w-12 h-12 text-slate-700 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Decrypting Graph Nodes</p>
        </div>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-slate-950">
        <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">Release Discovery Failed</p>
      </div>
    );
  }

  const releaseName = typeof release.name === 'object' ? (release.name as any).en : release.name;
  const variantName = variant ? (typeof variant.name === 'object' ? (variant.name as any).en : variant.name) : "---";
  const modelName = model ? (typeof model.name === 'object' ? (model.name as any).en : model.name) : "---";
  const brandName = brand ? (typeof brand.name === 'object' ? (brand.name as any).en : brand.name) : "---";

  return (
    <div className="flex-1 flex flex-col items-center py-12 px-8 lg:px-16 min-h-screen">
      <div className="w-full max-w-7xl space-y-12">
        
        {/* Top Navigation & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/[0.03] pb-12">
          <div className="space-y-6">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Return to Timeline</span>
            </button>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 overflow-hidden">
                {brand && (
                  <>
                    <button 
                      onClick={() => router.push('/console/brands')}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors truncate"
                    >
                      {brandName}
                    </button>
                    <ChevronRight className="w-3 h-3 text-slate-700 shrink-0" />
                  </>
                )}
                {model && (
                  <>
                    <button 
                      onClick={() => router.push(`/console/brands/model?brandId=${brand?.id}`)}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors truncate"
                    >
                      {modelName}
                    </button>
                    <ChevronRight className="w-3 h-3 text-slate-700 shrink-0" />
                  </>
                )}
                {variant && (
                  <button 
                    onClick={() => router.push(`/console/brands/model/variant?modelId=${model?.id}`)}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors truncate"
                  >
                    {variantName}
                  </button>
                )}
              </div>
              <h1 className="text-2xl lg:text-4xl font-black text-white tracking-tighter leading-tight max-w-4xl uppercase">
                {brandName} {modelName} <span className="text-slate-500">-</span> <span className="text-slate-400 font-normal ml-1">{variantName} {release.data?.year || releaseName}</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-8">
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
            
            <div className="text-right space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Technical Segment</p>
              <p className="text-lg font-black text-white uppercase">{blueprint?.name || "Standard"}</p>
            </div>
            <div className="w-px h-12 bg-white/5" />
            <div className="w-16 h-16 rounded-[2rem] bg-white flex items-center justify-center shadow-2xl">
              <Shield className="w-8 h-8 text-slate-950" />
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-8">
          
          {/* Main Content: Technical Specifications */}
          <div className="space-y-8">
            <div className="space-y-12 pt-4">
              {blueprint?.blueprint && Object.entries(blueprint.blueprint)
                .sort(([a], [b]) => {
                  const CATEGORY_ORDER = [
                    'engine_transmission',
                    'fuel_performance',
                    'mileage_performance',
                    'charging',
                    'suspension_steering_brakes',
                    'chassis_suspension',
                    'dimension_capacity',
                    'comfort_convenience',
                    'interior',
                    'exterior',
                    'safety',
                    'safety_security',
                    'features_safety',
                    'electricals',
                    'tyre_brakes',
                    'entertainment_communication',
                    'connectivity_tech'
                  ];
                  const indexA = CATEGORY_ORDER.indexOf(a);
                  const indexB = CATEGORY_ORDER.indexOf(b);
                  if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                  if (indexA === -1) return 1;
                  if (indexB === -1) return -1;
                  return indexA - indexB;
                })
                .map(([sectionKey, fields], sIdx) => {
                const filteredFields = Object.entries(fields as Record<string, any>).filter(([fieldKey, fieldConfig]) => {
                  const label = (fieldConfig.label || fieldKey.replace(/_/g, " ")).toLowerCase();
                  return label.includes(attributeSearchTerm.toLowerCase());
                });

                if (filteredFields.length === 0) return null;

                return (
                  <motion.div 
                    key={sectionKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sIdx * 0.1 }}
                    className="space-y-8"
                  >
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] border-l-2 border-emerald-500/30 pl-4">
                      {sectionKey.replace(/_/g, " ")}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredFields.map(([fieldKey, fieldConfig]) => {
                        const value = release.data?.[sectionKey]?.[fieldKey];
                        return (
                          <div key={fieldKey} className="group bg-white/[0.01] border border-white/[0.03] p-6 rounded-3xl hover:bg-white/[0.02] transition-all hover:border-white/10 flex items-center justify-between gap-4 relative overflow-hidden">
                          {editingField?.section === sectionKey && editingField?.field === fieldKey ? (
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

                              <div className="max-h-48 overflow-y-auto custom-scrollbar flex flex-col gap-1 p-1">
                                {attributeSearchTerm.trim() && (
                                  <button 
                                    onClick={() => handleQuickCreate(sectionKey, fieldKey, fieldConfig.type)}
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
                                        handleSaveEdit(sectionKey, fieldKey, node);
                                        setAttributeSearchTerm("");
                                      }}
                                      disabled={isUpdating}
                                      className="text-left px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group/opt"
                                    >
                                      <span>{typeof node.name === 'object' ? node.name.en : node.name}</span>
                                      <Check className="w-3 h-3 opacity-0 group-hover/opt:opacity-100 transition-opacity text-emerald-500" />
                                    </button>
                                  ))
                                ) : !attributeSearchTerm.trim() && (
                                  <div className="flex flex-col items-center gap-3 py-6">
                                    <p className="text-[10px] text-slate-600 uppercase font-black text-center">No nodes found in registry</p>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`/console/attribute/${fieldKey}`, '_blank');
                                      }}
                                      className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-emerald-400 transition-all flex items-center gap-2"
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                      Configure Nodes
                                    </button>
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
                              <div className="flex-1 space-y-4">
                                <p className="text-[10px] font-black text-slate-500 tracking-[0.15em] uppercase">
                                  {fieldConfig.label || fieldKey.replace(/_/g, " ")}
                                </p>
                                <div className="flex items-baseline gap-2">
                                  <p className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors">
                                    {fieldConfig.type === 'boolean' 
                                      ? (value === true || value === "Yes" || value === "true" ? "Yes" : "No")
                                      : (value !== undefined ? value : "---")
                                    }
                                  </p>
                                  {fieldConfig.unit && value !== undefined && (
                                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                                      {fieldConfig.unit}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col items-end justify-between self-stretch py-0.5">
                                <div className="flex items-center gap-2">
                                  {fieldConfig.type === "string" && (
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300/80">String</span>
                                  )}
                                  {fieldConfig.type === "number" && (
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-300/80">Number</span>
                                  )}
                                  {fieldConfig.type === "boolean" && (
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-300/80">Boolean</span>
                                  )}
                                </div>

                                <div className="pt-2">
                                  {fieldConfig.type === 'boolean' ? (
                                    <button 
                                      onClick={() => handleToggleBoolean(sectionKey, fieldKey, value)}
                                      disabled={isUpdating}
                                      className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                                        (value === true || value === "Yes" || value === "true") 
                                          ? 'bg-emerald-500/20 border-emerald-500/30' 
                                          : 'bg-white/5 border-white/10'
                                      } border flex items-center p-0.5 hover:scale-105`}
                                    >
                                      <motion.div 
                                        animate={{ 
                                          x: (value === true || value === "Yes" || value === "true") ? 20 : 0,
                                          backgroundColor: (value === true || value === "Yes" || value === "true") ? '#10b981' : '#475569'
                                        }}
                                        className="w-3.5 h-3.5 rounded-full shadow-lg"
                                      />
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => handleEditClick(sectionKey, fieldKey)}
                                      className="opacity-0 group-hover:opacity-100 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-500 hover:text-white transition-all"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
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
                  </motion.div>
                );
              }) }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RefreshCwIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

export default ReleaseDetailsPage;
