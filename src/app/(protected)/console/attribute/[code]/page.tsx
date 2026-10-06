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
import { PageLayout, PageContent } from "../../components";

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
    <PageLayout>
      <PageContent>
        {/* Management Editor */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full"
        >
          <AttributeEditor attribute={attribute} />
        </motion.div>
      </PageContent>
    </PageLayout>
  );
};

export default AttributeDetailPage;
