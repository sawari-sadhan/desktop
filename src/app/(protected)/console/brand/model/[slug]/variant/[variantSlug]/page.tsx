"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { graphClient, EntityNode, TypeBlueprint } from "@lib/core";


const getVariantValue = (variant: any, sectionKey: string, fieldKey: string, fieldConfig: any) => {
  if (!variant?.data) return undefined;
  
  if (variant.data[sectionKey]?.[fieldKey] !== undefined) {
    return variant.data[sectionKey][fieldKey];
  }
  
  const specs = variant.data.specifications;
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

const DEFAULT_BLUEPRINT = {
  engine_transmission: {
    engine_type: { label: "Engine Type", type: "string" },
    displacement: { label: "Displacement", type: "number", unit: "cc" },
    max_power: { label: "Max Power", type: "string" },
    max_torque: { label: "Max Torque", type: "string" },
    cylinders: { label: "No. of Cylinders", type: "number" },
    valves_per_cylinder: { label: "Valves Per Cylinder", type: "number" },
    transmission_type: { label: "Transmission Type", type: "string" },
    gearbox: { label: "Gearbox", type: "string" },
    drive_type: { label: "Drive Type", type: "string" }
  },
  fuel_performance: {
    fuel_type: { label: "Fuel Type", type: "string" },
    fuel_tank_capacity: { label: "Petrol Fuel Tank Capacity", type: "number", unit: "Litres" },
    highway_mileage: { label: "Petrol Highway Mileage", type: "number", unit: "kmpl" },
    top_speed: { label: "Top Speed", type: "number", unit: "kmph" },
    acceleration: { label: "Acceleration 0-100kmph", type: "number", unit: "s" }
  },
  suspension_steering_brakes: {
    front_suspension: { label: "Front Suspension", type: "string" },
    rear_suspension: { label: "Rear Suspension", type: "string" },
    steering_type: { label: "Steering Type", type: "string" },
    steering_column: { label: "Steering Column", type: "string" },
    turning_radius: { label: "Turning Radius", type: "number", unit: "m" },
    front_brake_type: { label: "Front Brake Type", type: "string" },
    rear_brake_type: { label: "Rear Brake Type", type: "string" }
  },
  dimension_capacity: {
    length: { label: "Length", type: "number", unit: "mm" },
    width: { label: "Width", type: "number", unit: "mm" },
    height: { label: "Height", type: "number", unit: "mm" },
    seating_capacity: { label: "Seating Capacity", type: "number" },
    wheel_base: { label: "Wheel Base", type: "number", unit: "mm" },
    ground_clearance: { label: "Ground Clearance Unladen", type: "number", unit: "mm" },
    kerb_weight: { label: "Kerb Weight", type: "number", unit: "kg" }
  },
  comfort_convenience: {
    power_steering: { label: "Power Steering", type: "boolean" },
    air_conditioner: { label: "Air Conditioner", type: "boolean" },
    heater: { label: "Heater", type: "boolean" },
    automatic_climate_control: { label: "Automatic Climate Control", type: "boolean" },
    cruise_control: { label: "Cruise Control", type: "boolean" },
    parking_sensors: { label: "Parking Sensors", type: "string" },
    keyless_entry: { label: "KeyLess Entry", type: "boolean" },
    engine_start_stop: { label: "Engine Start/Stop Button", type: "boolean" }
  },
  safety: {
    abs: { label: "Anti-lock Braking System (ABS)", type: "boolean" },
    brake_assist: { label: "Brake Assist", type: "boolean" },
    central_locking: { label: "Central Locking", type: "boolean" },
    airbags: { label: "No. of Airbags", type: "number" },
    tpms: { label: "Tyre Pressure Monitoring System (TPMS)", type: "boolean" },
    esc: { label: "Electronic Stability Control (ESC)", type: "boolean" },
    hill_assist: { label: "Hill Assist", type: "boolean" },
    camera_360: { label: "360 View Camera", type: "boolean" }
  }
};

const VariantDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const variantSlug = params.variantSlug as string;

  const [variant, setVariant] = useState<EntityNode | null>(null);
  const [model, setModel] = useState<EntityNode | null>(null);
  const [brand, setBrand] = useState<EntityNode | null>(null);
  const [blueprint, setBlueprint] = useState<TypeBlueprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingField, setEditingField] = useState<{ section: string; field: string } | null>(null);
  const [availableNodes, setAvailableNodes] = useState<EntityNode[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [attributeSearchTerm, setAttributeSearchTerm] = useState("");

  const loadData = async () => {
    if (!variantSlug) return;
    setIsLoading(true);
    try {
      // 1. Fetch Variant
      const variantRes = await graphClient.getNode({ id: "", slug: variantSlug });
      if (!variantRes.node) throw new Error("Variant not found");
      const mappedVariant: EntityNode = {
        id: variantRes.node.id,
        type: variantRes.node.type,
        slug: variantRes.node.slug,
        name: variantRes.node.name || {},
        description: variantRes.node.description || {},
        tags: variantRes.node.tags || [],
        metadata: variantRes.node.metadata || {},
        data: variantRes.node.data || {},
        created_at: "",
        updated_at: variantRes.node.updatedAt
      };
      setVariant(mappedVariant);

      // 2. Fetch Model
      const modelId = (variantRes.node.data?.parent_model_id || variantRes.node.metadata?.parent_model_id) as string;
      let mappedModel: EntityNode | null = null;
      if (modelId) {
        const modelRes = await graphClient.getNode({ id: modelId, slug: "" });
        if (modelRes.node) {
          mappedModel = {
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
        }
      }

      // 3. Fetch Brand
      const brandId = (mappedModel?.data?.parent_brand_id || mappedModel?.metadata?.parent_brand_id) as string;
      if (brandId) {
        const brandRes = await graphClient.getNode({ id: brandId, slug: "" });
        if (brandRes.node) {
          setBrand({
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
          });
        }
      }

      // 4. Load Blueprint directly
      setBlueprint({
        code: "automotive",
        name: "Automotive Technical Blueprint",
        blueprint: DEFAULT_BLUEPRINT,
        metadata: {}
      });
    } catch (err) {
      console.error("Failed to load variant details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [variantSlug]);

  const handleEditClick = async (section: string, field: string) => {
    setEditingField({ section, field });
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

  const handleSaveEdit = async (section: string, field: string, node: EntityNode) => {
    if (!variant) return;
    setIsUpdating(true);
    try {
      const updatedData = { ...variant.data };
      if (!updatedData.specifications) updatedData.specifications = {};
      
      const valueToSave = node.data?.value !== undefined ? node.data.value : node.name.en;
      
      const fieldConfig = blueprint?.blueprint?.[section]?.[field];
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
        id: variant.id,
        name: variant.name,
        description: variant.description,
        tags: variant.tags,
        metadata: variant.metadata,
        data: updatedData,
        embedding: []
      });

      setVariant({ ...variant, data: updatedData });
      setEditingField(null);
    } catch (err) {
      console.error("Failed to update attribute:", err);
      alert("Failed to save change.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleBoolean = async (section: string, field: string, currentValue: any) => {
    if (!variant || isUpdating) return;
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

      const updatedData = { ...variant.data };
      if (!updatedData.specifications) updatedData.specifications = {};
      
      const fieldConfig = blueprint?.blueprint?.[section]?.[field];
      let targetKey = fieldConfig?.label || field.replace(/_/g, " ");
      const cleanedKey = targetKey.toLowerCase();
      for (const k of Object.keys(updatedData.specifications)) {
        if (k.toLowerCase() === cleanedKey) {
          targetKey = k;
          break;
        }
      }
      
      updatedData.specifications[targetKey] = targetValue ? "Yes" : "No";

      await graphClient.updateNode({
        id: variant.id,
        name: variant.name,
        description: variant.description,
        tags: variant.tags,
        metadata: variant.metadata,
        data: updatedData,
        embedding: []
      });

      setVariant({ ...variant, data: updatedData });
    } catch (err) {
      console.error("Failed to toggle boolean:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickCreate = async (section: string, field: string, type: string) => {
    if (!attributeSearchTerm.trim() || !variant) return;
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
      <div className="flex-1 flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <RefreshCw className="w-12 h-12 text-slate-400 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Decrypting Graph Nodes</p>
        </div>
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-slate-50">
        <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">Variant Discovery Failed</p>
      </div>
    );
  }

  const variantName = typeof variant.name === 'object' ? (variant.name as any).en : variant.name;
  const modelName = model ? (typeof model.name === 'object' ? (model.name as any).en : model.name) : "---";
  const brandName = brand ? (typeof brand.name === 'object' ? (brand.name as any).en : brand.name) : "---";

  return (
    <div className="flex-1 p-12 min-h-screen">
      <div className="w-full space-y-12">
        

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
                        const rawValue = getVariantValue(variant, sectionKey, fieldKey, fieldConfig);
                        const value = formatValue(rawValue);
                        return (
                          <div key={fieldKey} className="group bg-white border border-slate-200 p-6 rounded-3xl hover:bg-slate-50 transition-all hover:border-slate-200 flex items-center justify-between gap-4 relative overflow-hidden">
                          {editingField?.section === sectionKey && editingField?.field === fieldKey ? (
                            <div className="flex-1 flex flex-col gap-4 relative z-10">
                              <div className="flex items-center justify-between gap-4">
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest truncate">
                                  Editing {fieldConfig.label || fieldKey.replace(/_/g, " ")}
                                </p>
                                <button 
                                  onClick={() => setEditingField(null)}
                                  className="text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors"
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
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-10 text-xs text-slate-900 focus:ring-1 focus:ring-slate-300 transition-all"
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
                                      className="text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 hover:text-slate-900 transition-all flex items-center justify-between group/opt"
                                    >
                                      <span>{typeof node.name === 'object' ? node.name.en : node.name}</span>
                                      <Check className="w-3 h-3 opacity-0 group-hover/opt:opacity-100 transition-opacity text-emerald-500" />
                                    </button>
                                  ))
                                ) : !attributeSearchTerm.trim() && (
                                  <div className="flex flex-col items-center gap-3 py-6">
                                    <p className="text-[10px] text-slate-600 uppercase font-black text-center">No nodes found in registry</p>
                                  </div>
                                )}
                              </div>
                              {isUpdating && (
                                <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
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
                                  <p className="text-xl font-black text-slate-900 group-hover:text-emerald-400 transition-colors">
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
                                          : 'bg-slate-50 border-slate-200'
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
                                      className="opacity-0 group-hover:opacity-100 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 transition-all"
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

const VariantDetailsPageWithSuspense = () => (
  <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-screen text-slate-500">Loading Variant Details...</div>}>
    <VariantDetailsPage />
  </Suspense>
);

export default VariantDetailsPageWithSuspense;
