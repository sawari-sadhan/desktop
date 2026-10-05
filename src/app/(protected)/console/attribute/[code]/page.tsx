"use client";

import React, { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Activity,
  Code2,
  Tag
} from "lucide-react";
import { useRouter } from "next/navigation";
import { graphClient, NodeType } from "@lib/core";
import { AttributeEditor } from "./components/AttributeEditor";

const AttributeDetailPage = ({ params }: { params: Promise<{ code: string }> }) => {
  const router = useRouter();
  const { code } = use(params);
  const [attribute, setAttribute] = useState<NodeType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAttribute = async () => {
      setIsLoading(true);
      try {
        const data = await graphClient.getNodeType({ code });
        setAttribute(data.nodeType || null);
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
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!attribute) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen space-y-4">
        <Activity className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Attribute not found in registry</p>
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  const attrType = (attribute.dataTypes as any)?.type || "string";

  return (
    <div className="flex-1 p-12 min-h-screen">
      <div className="w-full space-y-10">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 shadow-sm rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Registry</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/5 border border-white/10 shadow-sm rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400">
              Technical Node
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative bg-white/[0.02] border border-white/10 rounded-[3rem] p-12 overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
          
          <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-3xl font-black uppercase shadow-sm">
              {attribute.code.slice(0, 2)}
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                  {attribute.name}
                </h1>
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <Code2 className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-mono text-slate-300 uppercase">{attribute.code}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{attrType}</span>
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
          className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 shadow-sm"
        >
          <AttributeEditor attribute={attribute} />
        </motion.div>


      </div>
    </div>
  );
};

export default AttributeDetailPage;
