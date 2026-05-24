"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  Shield, Layers, RefreshCw, ChevronLeft,
  Sliders, Cpu, Fuel, Cog, Info
} from "lucide-react";
import Link from "next/link";
import { graphClient, EntityNode } from "@lib/core";
import { theme } from "../../../theme";

const KEY_SPECS_LABELS: Record<string, { label: string; icon: any; unit?: string }> = {
  engine_type: { label: "Engine Type", icon: Cpu },
  displacement: { label: "Displacement", icon: Milestone, unit: "cc" },
  max_power: { label: "Max Power", icon: Sliders },
  max_torque: { label: "Max Torque", icon: Cog },
  transmission_type: { label: "Transmission", icon: Sliders },
  fuel_type: { label: "Fuel Type", icon: Fuel },
  seating_capacity: { label: "Seating Capacity", icon: Layers },
};

function Milestone(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

export default function VariantDetailPage() {
  const params = useParams();
  const brandSlug = params.brand as string;
  const modelSlug = params.model as string;
  const variantSlug = params.variant as string;

  const [brand, setBrand] = useState<EntityNode | null>(null);
  const [model, setModel] = useState<EntityNode | null>(null);
  const [variant, setVariant] = useState<EntityNode | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!brandSlug || !modelSlug || !variantSlug) return;
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Brand node
      const brandRes = await graphClient.getNode({ id: "", slug: brandSlug });
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

      // 2. Fetch Model node
      const reconstructedModelSlug = modelSlug.startsWith(`${brandSlug}-`) 
        ? modelSlug 
        : `${brandSlug}-${modelSlug}`;

      let modelRes = await graphClient.getNode({ id: "", slug: reconstructedModelSlug });
      if (!modelRes.node && reconstructedModelSlug !== modelSlug) {
        modelRes = await graphClient.getNode({ id: "", slug: modelSlug });
      }

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
      }

      // 3. Fetch Variant node by slug
      const resolvedModelSlug = modelRes.node ? modelRes.node.slug : reconstructedModelSlug;
      const reconstructedVariantSlug = variantSlug.startsWith(`${resolvedModelSlug}-`)
        ? variantSlug
        : `${resolvedModelSlug}-${variantSlug}`;

      let variantRes = await graphClient.getNode({ id: "", slug: reconstructedVariantSlug });
      if (!variantRes.node && reconstructedVariantSlug !== variantSlug) {
        variantRes = await graphClient.getNode({ id: "", slug: variantSlug });
      }

      if (!variantRes.node) {
        setError("Variant not found in registry");
        setIsLoading(false);
        return;
      }

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

    } catch (err) {
      console.error("Failed to load variant details:", err);
      setError("Failed to resolve variant registry data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [brandSlug, modelSlug, variantSlug]);

  const getSpecValue = (node: EntityNode, fieldKey: string) => {
    if (!node?.data) return undefined;
    if (node.data[fieldKey] !== undefined) {
      return node.data[fieldKey];
    }
    const specs = node.data.specifications;
    if (!specs) return undefined;
    
    const config = KEY_SPECS_LABELS[fieldKey];
    if (config?.label) {
      const cleanedLabel = config.label.toLowerCase();
      for (const k of Object.keys(specs)) {
        if (k.toLowerCase() === cleanedLabel) {
          const valObj = specs[k];
          return typeof valObj === 'object' && valObj !== null ? valObj.value : valObj;
        }
      }
    }
    return undefined;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Loading Variant...</span>
      </div>
    );
  }

  if (error || !variant) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-8 space-y-4">
        <Shield className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{error || "Variant Profile Error"}</p>
        <Link 
          href={`/${brandSlug}/${modelSlug}`}
          className="px-5 py-2 bg-slate-200 hover:bg-slate-300/80 border border-slate-300/60 rounded-xl text-slate-700 text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Return to Model Details
        </Link>
      </div>
    );
  }

  const brandName = brand ? (typeof brand.name === 'object' ? (brand.name?.en || brand.name?.default || "Brand") : (brand.name || "Brand")) : "Brand";
  const modelName = model ? (typeof model.name === 'object' ? (model.name?.en || model.name?.default || "Model") : (model.name || "Model")) : "Model";
  const variantName = typeof variant.name === 'object' ? (variant.name?.en || variant.name?.default || "Unnamed Variant") : (variant.name || "Unnamed Variant");

  // Compile specifications: merge variant specifications and fall back to model specifications if missing
  const specsGridList = Object.entries(KEY_SPECS_LABELS).map(([fieldKey, specConfig]) => {
    // Try variant node first, then fall back to model node
    const val = getSpecValue(variant, fieldKey) ?? (model ? getSpecValue(model, fieldKey) : undefined);
    return { fieldKey, specConfig, val };
  });

  // Extract other metadata fields from variant node data
  const dataSpecs = variant.data?.specifications || {};
  const otherSpecs = Object.entries(dataSpecs).filter(([k]) => {
    const isMainSpec = Object.values(KEY_SPECS_LABELS).some(c => c.label.toLowerCase() === k.toLowerCase());
    return !isMainSpec;
  });

  return (
    <div className={`flex-1 min-h-screen py-10 px-8 max-w-5xl mx-auto space-y-10 ${theme.pageBg}`}>
      
      {/* Back Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-6">
        <Link 
          href={`/${brandSlug}/${modelSlug}`}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-[10px] font-black uppercase tracking-widest transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to {modelName} Profile
        </Link>
        <div className="inline-flex items-center gap-2 text-slate-400 font-mono text-[9px] uppercase tracking-widest">
          variant: {variant.slug}
        </div>
      </div>

      {/* Variant Detail Overview */}
      <div className="bg-white border border-slate-200/60 p-8 rounded-[2rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-48 h-48 bg-teal-500/[0.01] rounded-full blur-3xl" />
        
        <div className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <div className={theme.drawerBadge}>
              <Shield className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest">{brandName} {modelName} Trim</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">{variantName}</h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">
              {typeof variant.description === 'object' ? (variant.description?.en || `Technical variant specifications for the ${brandName} ${modelName} ${variantName}.`) : (variant.description || `Technical variant specifications for the ${brandName} ${modelName} ${variantName}.`)}
            </p>
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-l-2 border-slate-300 pl-3">
          Key Technical Specifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specsGridList.map(({ fieldKey, specConfig, val }) => {
            const IconComp = specConfig.icon;
            return (
              <div key={fieldKey} className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200/40">
                    <IconComp className="w-4 h-4 text-slate-500" />
                  </div>
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">{specConfig.label}</span>
                </div>
                <span className="text-xs font-black text-slate-800">
                  {val !== undefined ? `${val}${specConfig.unit ? ` ${specConfig.unit}` : ''}` : '---'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Technical Blueprint if available */}
      {otherSpecs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-l-2 border-slate-300 pl-3">
            Detailed Technical Blueprint
          </h2>
          <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-xs overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-xs">
              {otherSpecs.map(([k, vObj]: [string, any]) => {
                const displayVal = typeof vObj === 'object' && vObj !== null ? vObj.value : vObj;
                return (
                  <div key={k} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">{k}</span>
                    <span className="font-black text-slate-800 uppercase tracking-tight text-[11px]">{displayVal}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
