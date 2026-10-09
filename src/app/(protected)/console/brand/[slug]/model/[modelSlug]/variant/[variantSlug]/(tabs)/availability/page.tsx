"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Car, MapPin, Save, Globe } from "lucide-react";
import { graphClient, EntityNode } from "@lib/core";

const COUNTRIES = [
  { code: 'np', name: 'Nepal', currency: 'NPR', symbol: 'Rs.' },
  { code: 'in', name: 'India', currency: 'INR', symbol: '₹' },
  { code: 'lk', name: 'Sri Lanka', currency: 'LKR', symbol: 'Rs.' },
  { code: 'bd', name: 'Bangladesh', currency: 'BDT', symbol: '৳' },
  { code: 'th', name: 'Thailand', currency: 'THB', symbol: '฿' }
];

export default function AvailabilityPage() {
  const params = useParams();
  const variantSlug = params.variantSlug as string;
  
  const [variant, setVariant] = useState<EntityNode | null>(null);
  const [availableLinks, setAvailableLinks] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0].code);
  const [price, setPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    if (!variantSlug) return;
    setIsLoading(true);
    setIsNotFound(false);
    try {
      const res = await graphClient.getNode({ id: "", slug: variantSlug });
      if (!res.node || !res.node.id) {
        setIsNotFound(true);
        return;
      }
      
      const v: EntityNode = {
        id: res.node.id,
        type: res.node.type,
        slug: res.node.slug,
        name: res.node.name || {},
        description: res.node.description || {},
        tags: res.node.tags || [],
        metadata: res.node.metadata || {},
        data: res.node.data || {},
        updated_at: res.node.updatedAt
      };
      setVariant(v);

      const neighbors = await graphClient.getNeighbors({
        nodeId: v.id,
        linkTypes: ["available_in"]
      });
      
      const links = (neighbors as any).links || [];
      const linkedCountries = (neighbors.nodes || []).filter(n => n.type === 'country');
      
      const mappedAvailability = linkedCountries.map(c => {
         const link = links.find((l:any) => l.targetId === c.id || l.sourceId === c.id);
         return {
           country: c,
           price: link?.metadata?.price || 0,
           currency: link?.metadata?.currency || 'Unknown'
         };
      });
      setAvailableLinks(mappedAvailability);
    } catch (err) {
      console.error(err);
      setIsNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [variantSlug]);

  const handleAddAvailability = async () => {
    if (!variant || !price) return;
    setIsSaving(true);
    try {
      const countryConf = COUNTRIES.find(c => c.code === selectedCountry)!;
      let countryNodeId = "";
      try {
         const cRes = await graphClient.getNode({ id: "", slug: selectedCountry });
         countryNodeId = cRes.node!.id;
      } catch {
         const newC = await graphClient.createNode({
           type: "country",
           slug: selectedCountry,
           name: { en: countryConf.name },
           description: { en: `Geographic region configuration for ${countryConf.name}` },
           tags: [selectedCountry],
           metadata: { context: "System Setup" },
           data: { currency_code: countryConf.currency, currency_symbol: countryConf.symbol }
         });
         countryNodeId = newC.node!.id;
      }

      await graphClient.addLink({
        sourceId: variant.id,
        targetId: countryNodeId,
        linkType: "available_in",
        metadata: {
           status: "available",
           price: parseFloat(price),
           currency: countryConf.currency
        }
      });
      
      setPrice("");
      loadData();
    } catch(err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isNotFound) {
    return (
      <div className="flex-1 p-12 bg-slate-50 flex flex-col items-center justify-center">
        <div className="bg-white p-12 rounded-[2rem] border border-slate-200 shadow-sm text-center max-w-lg">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-inner">
            <Car className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Variant Not Found</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            The variant <strong className="text-slate-700">"{variantSlug}"</strong> does not exist in the database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-12 max-w-5xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
            <Car className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {isLoading ? "Loading..." : ((variant?.name as any)?.en || variantSlug)}
            </h1>
            <div className="flex gap-3 mt-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black tracking-widest uppercase">Variant</span>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black tracking-widest uppercase">{variantSlug}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm self-start">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Add Availability</h2>
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Select Country</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 transition-all"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Local Price</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  {COUNTRIES.find(c => c.code === selectedCountry)?.symbol}
                </div>
                <input 
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter amount..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 transition-all"
                />
              </div>
            </div>
            <button 
              onClick={handleAddAvailability}
              disabled={isSaving || !price}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl py-3 px-4 font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? <span className="animate-pulse">Saving...</span> : <><Save className="w-4 h-4" /> Save Pricing</>}
            </button>
          </div>
        </div>
        <div className="md:col-span-2 space-y-4">
           {isLoading ? (
             <div className="h-40 bg-white rounded-[2rem] border border-slate-200 flex items-center justify-center text-slate-400 animate-pulse font-medium">Loading availability...</div>
           ) : availableLinks.length === 0 ? (
              <div className="h-40 bg-slate-50 border border-slate-200 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <MapPin className="w-8 h-8 mb-3 text-slate-300" />
                <p className="font-bold">No availability data yet</p>
                <p className="text-xs mt-1 max-w-[250px]">Use the form to define which countries this variant is sold in and its local price.</p>
              </div>
           ) : (
              <AnimatePresence>
                {availableLinks.map((al, i) => (
                  <motion.div 
                    key={al.country.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 p-6 rounded-[1.5rem] flex items-center justify-between hover:border-slate-300 transition-all shadow-sm"
                  >
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-xl shadow-sm border border-slate-100">
                         <span className="font-black text-slate-400 uppercase text-xs">{al.country.slug}</span>
                       </div>
                       <div>
                         <h3 className="font-bold text-slate-800 text-lg">
                           {(al.country.name as any)?.en || al.country.slug.toUpperCase()}
                         </h3>
                         <div className="flex items-center gap-2 mt-1">
                           <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[9px] font-black uppercase tracking-widest">Available</span>
                         </div>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Local Price</p>
                       <div className="flex items-end gap-1 justify-end">
                         <span className="text-slate-500 font-bold mb-0.5">{al.currency}</span>
                         <span className="text-2xl font-black text-slate-900">{al.price.toLocaleString()}</span>
                       </div>
                     </div>
                  </motion.div>
                ))}
              </AnimatePresence>
           )}
        </div>
      </div>
    </div>
  );
}
