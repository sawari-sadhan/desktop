"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCw, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { graphClient, NodeType } from "@lib/core";
import { theme } from "../theme";
import { PageLayout, PageHeader, PageTitle, PageActions, PageContent } from "../components";

const AttributeRegistryPage = () => {
  const router = useRouter();
  const [attributes, setAttributes] = useState<NodeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadAttributes = async () => {
    setIsLoading(true);
    try {
      const data = await graphClient.listNodeTypes({ parentCode: "attribute" });
      setAttributes(data.nodeTypes || []);
    } catch (err) {
      console.error("Failed to load attributes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttributes();
  }, []);

  const filteredAttributes = (attributes || []).filter(attr => {
    const nameStr = (typeof attr.name === 'object' ? (attr.name as any)?.text || (attr.name as any)?.en || "" : (attr.name || "")).toString().toLowerCase();
    return nameStr.includes(searchTerm.toLowerCase()) || attr.code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <PageLayout>
      <PageContent>
        {/* Attribute Grid */}
        <div className={theme.layout.grid}>
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-[2rem] h-56 animate-pulse" />
              ))
            ) : filteredAttributes.length > 0 ? (
              filteredAttributes.map((attr, idx) => {
                const attrType = (attr.dataTypes as any)?.type || "string";
                const nodeCount = attr.nodeCount;
                return (
                  <motion.div
                    key={attr.code}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.005 }}
                    whileHover={{ y: -4, backgroundColor: "rgba(0,0,0,0.02)" }}
                    onClick={() => router.push(`/console/attribute/${attr.code}`)}
                    className={theme.components.card}
                  >
                    <div className={theme.components.cardDecorativeBg} />
                    
                    {attrType === "boolean" && nodeCount > 0 && (
                      <motion.div 
                        initial={{ opacity: 0.4 }}
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-7 right-7 w-1 h-1 bg-amber-400/80 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)] z-20" 
                      />
                    )}
                    
                    <div className="space-y-8 relative">
                      <div className="flex items-start justify-between">
                        <div className={theme.components.cardIconContainer}>
                          {(typeof attr.name === 'object' ? (attr.name as any)?.text || (attr.name as any)?.en || "?" : (attr.name || "?"))[0].toUpperCase()}
                        </div>
                        <div className={theme.components.cardBadge}>
                          {attr.code}
                        </div>
                      </div>

                      <div>
                        <h3 className={theme.typography.cardTitle}>
                          {typeof attr.name === 'object' ? (attr.name as any)?.text || (attr.name as any)?.en || "Unnamed Attribute" : (attr.name || "Unnamed Attribute")}
                        </h3>
                        <p className={theme.typography.cardSubtitle}>
                          {typeof attr.description === 'object' ? (attr.description as any)?.text || (attr.description as any)?.en || "Attribute for vehicle specifications" : (attr.description || "Attribute for vehicle specifications")}
                        </p>
                      </div>

                      <div className={theme.components.cardFooter}>
                        <div className={theme.components.cardFooterItem}>
                          <span className={theme.components.cardFooterText}>
                            Type: <span className="uppercase">{attrType}</span>
                          </span>
                        </div>
                        <div className={theme.components.cardFooterItem}>
                          <span className={theme.components.cardFooterText}>
                            Nodes: {nodeCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <Search className="w-12 h-12 text-slate-500 mx-auto" />
                <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">No matching attributes found</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </PageContent>
    </PageLayout>
  );
};

export default AttributeRegistryPage;
