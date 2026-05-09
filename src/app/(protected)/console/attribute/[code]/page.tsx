"use client";

import React, { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Layers, 
  Activity,
  Code2,
  Tag
} from "lucide-react";
import { useRouter } from "next/navigation";
import { attributeApi, AttributeNode } from "$lib/v1/graph/attribute";
import { AttributeEditor } from "./components/AttributeEditor";

const AttributeDetailPage = ({ params }: { params: Promise<{ code: string }> }) => {
  const router = useRouter();
  const { code } = use(params);
  const [attribute, setAttribute] = useState<AttributeNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAttribute = async () => {
      setIsLoading(true);
      try {
        const data = await attributeApi.getByCode(code);
        setAttribute(data);
      } catch (err) {
        console.error("Failed to load attribute:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAttribute();
  }, [code]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    );
  }

  if (!attribute) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen space-y-4">
        <Activity className="w-12 h-12 text-slate-700" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Attribute not found in registry</p>
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center py-12 px-8 lg:px-12 min-h-screen">
      <div className="w-full max-w-4xl space-y-10">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Registry</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500">
              Technical Node
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative bg-white/[0.02] border border-white/[0.05] rounded-[3rem] p-12 overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/[0.02] rounded-full blur-[100px]" />
          
          <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-3xl font-black uppercase shadow-2xl">
              {attribute.code.slice(0, 2)}
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                  {attribute.name}
                </h1>
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <Code2 className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] font-mono text-slate-300 uppercase">{attribute.code}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <Tag className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{attribute.data_types.type}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Management Editor */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.01] border border-white/[0.03] rounded-[3rem] p-10 shadow-2xl"
        >
          <AttributeEditor attribute={attribute} />
        </motion.div>


      </div>
    </div>
  );
};

export default AttributeDetailPage;
