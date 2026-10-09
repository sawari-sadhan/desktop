"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Car, Save, Settings2, CheckCircle2 } from "lucide-react";
import { graphClient, EntityNode } from "@lib/core";
import { motion, AnimatePresence } from "framer-motion";

const SPEC_GROUPS: Record<string, string[]> = {
  Engines: [
    "Engine Type", "Displacement", "No. of Cylinders", "Max Power", "Max Torque",
    "Transmission Type", "Drive Type", "Top Speed", "Acceleration 0-100kmph",
    "Motor Type", "Motor Power", "Battery Capacity", "Battery Type", "Range"
  ],
  Fuel: [
    "Fuel Type", "Fuel Tank Capacity", "Mileage ARAI", "Charging Time (A.C)",
    "Charging Time (D.C)", "Fast Charging", "Battery Warranty"
  ],
  Safety: [
    "No. of Airbags", "Anti-lock Braking System (ABS)", "Electronic Stability Control (ESC)",
    "Traction Control", "Hill Assist", "Tyre Pressure Monitoring System (TPMS)",
    "Blind Spot Monitor", "Lane Departure Warning", "Automatic Emergency Braking",
    "Global NCAP Safety Rating"
  ],
  Interior: [
    "Seating Capacity", "Upholstery", "Ventilated Seats", "Digital Cluster",
    "Digital Cluster Size", "Ambient Light Colour (numbers)"
  ],
  Comfort: [
    "Automatic Climate Control", "Rear AC Vents", "Sunroof", "Power Windows",
    "Keyless Entry", "Cruise Control", "Adaptive Cruise Control"
  ],
  Steering: [
    "Power Steering", "Front Suspension", "Rear Suspension", "Front Brake Type", "Rear Brake Type"
  ],
  Exterior: [
    "Body Type", "Length", "Width", "Height", "Wheel Base", "Ground Clearance Unladen",
    "Kerb Weight", "Tyre Size", "Alloy Wheels", "LED Headlamps"
  ],
  Communication: [
    "Touchscreen", "Touchscreen Size", "Android Auto", "Apple CarPlay",
    "Bluetooth Connectivity", "Wireless Phone Charging", "Premium Sound System"
  ]
};

export default function SpecificationPage() {
  const params = useParams();
  const variantSlug = params.variantSlug as string;
  
  const [variant, setVariant] = useState<EntityNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [isSavingSpecs, setIsSavingSpecs] = useState(false);
  const [activeGroup, setActiveGroup] = useState(Object.keys(SPEC_GROUPS)[0]);
  const [showSaved, setShowSaved] = useState(false);

  const loadData = async () => {
    if (!variantSlug) return;
    setIsLoading(true);
    try {
      const res = await graphClient.getNode({ id: "", slug: variantSlug });
      if (!res.node || !res.node.id) return;
      
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
      setVariant(v);
      setSpecs(v.data?.specifications || {});

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [variantSlug]);

  const handleSpecChange = (key: string, value: string) => {
    setSpecs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSpecs = async () => {
    if (!variant) return;
    setIsSavingSpecs(true);
    try {
      await graphClient.updateNode({
        id: variant.id,
        name: variant.name,
        description: variant.description,
        tags: variant.tags,
        metadata: variant.metadata,
        data: { ...variant.data, specifications: specs },
        media: (variant.media || []) as any
      });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
      loadData();
    } catch (err) {
      console.error("Failed to save specs", err);
    } finally {
      setIsSavingSpecs(false);
    }
  };

  return (
    <div className="p-12 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isLoading ? "Loading..." : ((variant?.name as any)?.en || variantSlug)}
          </h1>
          <p className="text-slate-500 font-medium mt-2">Manage structured technical specifications</p>
        </div>
        <button 
          onClick={handleSaveSpecs}
          disabled={isSavingSpecs}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl py-3.5 px-8 font-black text-sm tracking-wide transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
        >
          {isSavingSpecs ? "Saving..." : showSaved ? <><CheckCircle2 className="w-5 h-5" /> Saved!</> : <><Save className="w-5 h-5" /> Save Changes</>}
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex min-h-[600px]">
        {/* Sidebar Groups */}
        <div className="w-64 bg-slate-50/50 border-r border-slate-200 p-6 space-y-2">
          {Object.keys(SPEC_GROUPS).map(group => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={`w-full text-left px-5 py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-between ${
                activeGroup === group 
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-200" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
              }`}
            >
              {group}
              {activeGroup === group && <Settings2 className="w-4 h-4 opacity-50" />}
            </button>
          ))}
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-10 bg-white">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900">{activeGroup} Specifications</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Update the {activeGroup.toLowerCase()} parameters for this variant.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {SPEC_GROUPS[activeGroup].map(specKey => (
              <div key={specKey} className="space-y-2">
                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  {specKey}
                </label>
                <input
                  type="text"
                  value={specs[specKey] || ""}
                  onChange={(e) => handleSpecChange(specKey, e.target.value)}
                  placeholder={`Enter ${specKey.toLowerCase()}...`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
