"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Shield, Layers, RefreshCw, ChevronLeft,
  Sliders, Cpu, Fuel, Cog 
} from "lucide-react";
import Link from "next/link";
import { graphClient, EntityNode } from "@lib/core";
import { theme } from "../../theme";

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

export default function ModelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const brandSlug = params.brand as string;
  const modelSlug = params.model as string;

  const [brand, setBrand] = useState<EntityNode | null>(null);
  const [model, setModel] = useState<EntityNode | null>(null);
  const [variants, setVariants] = useState<EntityNode[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!brandSlug || !modelSlug) return;
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

      // 2. Fetch Model node by slug
      const reconstructedModelSlug = modelSlug.startsWith(`${brandSlug}-`) 
        ? modelSlug 
        : `${brandSlug}-${modelSlug}`;

      let modelRes = await graphClient.getNode({ id: "", slug: reconstructedModelSlug });
      if (!modelRes.node && reconstructedModelSlug !== modelSlug) {
        modelRes = await graphClient.getNode({ id: "", slug: modelSlug });
      }

      if (!modelRes.node) {
        setError("Model not found in directory");
        setIsLoading(false);
        return;
      }

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

      // 3. Fetch variants linked to this model
      setIsLoadingVariants(true);
      const neighborsResponse = await graphClient.getNeighbors({
        nodeId: mappedModel.id,
        linkTypes: ["has_variant"]
      });
      
      const mappedVariants: EntityNode[] = (neighborsResponse.nodes || []).map(n => ({
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
      setError("Failed to resolve model registry data");
    } finally {
      setIsLoading(false);
      setIsLoadingVariants(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [brandSlug, modelSlug]);

  const getModelSpecValue = (modelNode: EntityNode, fieldKey: string) => {
    if (!modelNode?.data) return undefined;
    if (modelNode.data[fieldKey] !== undefined) {
      return modelNode.data[fieldKey];
    }
    const specs = modelNode.data.specifications;
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
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Loading Model Details...</span>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-8 space-y-4">
        <Shield className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{error || "Model Profile Error"}</p>
        <Link 
          href={`/${brandSlug}`}
          className="px-5 py-2 bg-slate-200 hover:bg-slate-300/80 border border-slate-300/60 rounded-xl text-slate-700 text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Return to Brand Profile
        </Link>
      </div>
    );
  }

  const brandName = brand ? (typeof brand.name === 'object' ? (brand.name?.en || brand.name?.default || "Brand") : (brand.name || "Brand")) : "Brand";
  const modelName = typeof model.name === 'object' ? (model.name?.en || model.name?.default || "Unnamed Model") : (model.name || "Unnamed Model");

  return (
    <div className={`flex-1 min-h-screen py-10 px-8 max-w-5xl mx-auto space-y-10 ${theme.pageBg}`}>
      
      {/* Back Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-6">
        <Link 
          href={`/${brandSlug}`}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-[10px] font-black uppercase tracking-widest transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to {brandName} Profile
        </Link>
        <div className="inline-flex items-center gap-2 text-slate-400 font-mono text-[9px] uppercase tracking-widest">
          model: {model.slug}
        </div>
      </div>

      {/* Model Detail Overview */}
      <div className="bg-white border border-slate-200/60 p-8 rounded-[2rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-48 h-48 bg-teal-500/[0.01] rounded-full blur-3xl" />
        
        <div className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <div className={theme.drawerBadge}>
              <Shield className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest">{brandName} Model</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">{modelName}</h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">
              {typeof model.description === 'object' ? (model.description?.en || "No model description available.") : (model.description || "No model description available.")}
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
          {Object.entries(KEY_SPECS_LABELS).map(([fieldKey, specConfig]) => {
            const specVal = getModelSpecValue(model, fieldKey);
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
                  {specVal !== undefined ? `${specVal}${specConfig.unit ? ` ${specConfig.unit}` : ''}` : '---'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technical Variants */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-l-2 border-slate-300 pl-3">
          Registered Variants
        </h2>
        
        {isLoadingVariants ? (
          <div className="py-6 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 text-teal-600 animate-spin" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">Querying Variants...</span>
          </div>
        ) : variants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {variants.map((v) => {
              const variantName = typeof v.name === 'object' ? (v.name?.en || v.slug) : (v.name || v.slug);
              
              const reconstructedModelSlug = modelSlug.startsWith(`${brandSlug}-`) 
                ? modelSlug 
                : `${brandSlug}-${modelSlug}`;
              
              const cleanVariantSlug = v.slug.startsWith(`${reconstructedModelSlug}-`)
                ? v.slug.substring(reconstructedModelSlug.length + 1)
                : v.slug;

              return (
                <div 
                  key={v.id}
                  onClick={() => router.push(`/${brandSlug}/${modelSlug}/${cleanVariantSlug}`)}
                  className="bg-white border border-slate-200/60 p-4.5 rounded-2xl shadow-xs hover:border-teal-500/30 hover:shadow-md cursor-pointer transition-all flex items-center justify-between"
                >
                  <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{variantName}</span>
                  <span className="text-[8px] font-mono font-black uppercase tracking-widest text-slate-400 bg-slate-100 border border-slate-200/40 px-2.5 py-1 rounded-md">
                    Explore
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 border border-dashed border-slate-200 rounded-[2rem] text-center space-y-2 bg-white">
            <Layers className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">No variants registered for this model</p>
          </div>
        )}
      </div>

    </div>
  );
}
