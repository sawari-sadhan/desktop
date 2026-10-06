"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Check, X, Hash, Loader2, CheckCircle2, Workflow, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { graphClient, EntityNode } from "@lib/core";
import { InlineDeleteConfirmation } from "@/app/components/confirmation/delete";
import { theme } from "../../../theme";

interface NumberEditorProps {
  attributeCode: string;
  name: string;
  unit?: string;
}

const mapNodeToEntityNode = (n: any): EntityNode => ({
  id: n.id,
  type: n.type,
  slug: n.slug,
  name: n.name as any,
  description: n.description as any,
  tags: n.tags,
  metadata: n.metadata as any,
  data: n.data as any
});

export const NumberEditor = ({ attributeCode, name, unit }: NumberEditorProps) => {
  const [items, setItems] = useState<EntityNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newValue, setNewValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Deletion state
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});

  const loadItems = async () => {
    setIsLoading(true);
    try {
      // 1. Load Registry Nodes
      const searchRes = await graphClient.searchNodes({
        query: "",
        types: [attributeCode],
        limit: 1000
      });
      const nodes = (searchRes.nodes || []).map(mapNodeToEntityNode);
      setItems(nodes);

      // 2. Count Active Deployments via graph queries in parallel
      const counts: Record<string, number> = {};
      await Promise.all(
        (searchRes.nodes || []).map(async (item) => {
          try {
            const neighborsRes = await graphClient.getNeighbors({
              nodeId: item.id,
              linkTypes: ["has_attribute"]
            });
            const valStr = item.data?.value?.toString() || "";
            counts[valStr] = (neighborsRes.nodes || []).length;
          } catch (e) {
            console.error("Failed to get neighbors for:", item.id, e);
          }
        })
      );
      setItemCounts(counts);
    } catch (err) {
      console.error("Failed to load nodes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [attributeCode]);

  const handleAdd = async () => {
    const val = parseFloat(newValue);
    if (isNaN(val)) return;
    setIsSubmitting(true);
    try {
      const slug = `${attributeCode}-${val}-${Date.now().toString().slice(-4)}`;
      const res = await graphClient.createNode({
        type: attributeCode,
        slug: slug,
        name: { en: `${val} ${unit || ""}`.trim() } as any,
        description: { en: `Instance of ${name}` } as any,
        tags: ["attribute", attributeCode],
        metadata: { value: val, display: `${val} ${unit || ""}`.trim() } as any,
        data: { value: val, unit: unit || null } as any
      });
      if (res.node) {
        setItems([...items, mapNodeToEntityNode(res.node)]);
        setNewValue("");
        setSuccessMessage(`${val} ${unit || ""} added to registry`);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to create node:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async (id: string) => {
    const val = parseFloat(editValue);
    if (isNaN(val)) return;
    const existing = items.find(item => item.id === id);
    if (!existing) return;
    setIsSubmitting(true);
    try {
      const res = await graphClient.updateNode({
        id: id,
        name: { en: `${val} ${unit || ""}`.trim() } as any,
        description: existing.description as any,
        tags: existing.tags,
        metadata: { ...existing.metadata, value: val, display: `${val} ${unit || ""}`.trim() } as any,
        data: { value: val, unit: unit || null } as any
      });
      if (res.node) {
        setItems(items.map(item => item.id === id ? mapNodeToEntityNode(res.node!) : item));
        setEditingId(null);
        setSuccessMessage(`Updated to ${val} ${unit || ""}`);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to update node:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      await graphClient.deleteNode({ id });
      setItems(items.filter(item => item.id !== id));
      setSuccessMessage("Numeric node removed");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to delete node:", err);
    } finally {
      setItemToDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute -top-12 left-0 right-0 z-20 flex justify-center"
          >
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-2 rounded-full flex items-center gap-3 backdrop-blur-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <Hash className="w-4 h-4 text-slate-500" />
          {name} Range Registry
        </h2>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {isLoading ? "Loading..." : `${items.length} Thresholds`}
        </span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            disabled={isSubmitting}
            placeholder={`Enter ${name.toLowerCase()} value...`}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-5 text-sm text-slate-900 focus:ring-1 focus:ring-slate-300 transition-all disabled:opacity-50"
          />
          {unit && (
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500 uppercase">
              {unit}
            </span>
          )}
        </div>
        <button
          onClick={handleAdd}
          disabled={isSubmitting || !newValue}
          className="px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add
        </button>
      </div>

      <div className={theme.layout.grid}>
        {isLoading ? (
          <div className="col-span-full py-10 flex justify-center">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {items.map((item) => {
              const valStr = item.data?.value?.toString() || "";
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={theme.components.card}
                >
                  <div className={theme.components.cardDecorativeBg} />
                  
                  <div className="space-y-8 relative">
                    <div className="flex items-center justify-between w-full">
                      {editingId === item.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-1 px-3 text-sm text-slate-900 focus:outline-none focus:border-slate-300"
                            autoFocus
                          />
                          <button onClick={() => handleSave(item.id)} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className={theme.components.cardIconContainer}>
                            #
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <span className={theme.components.cardBadge}>
                              {item.slug}
                            </span>
                            
                            {/* Deployment Count */}
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                              <Workflow className="w-2.5 h-2.5 text-emerald-500" />
                              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">
                                {itemCounts[valStr] || 0}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {!editingId || editingId !== item.id ? (
                      <div>
                        <Link 
                          href={`/console/attribute/${attributeCode}/list?value=${encodeURIComponent(valStr)}`}
                          className="block group-hover:text-blue-600 transition-colors"
                        >
                          <h3 className={theme.typography.cardTitle}>
                            {item.data?.value ?? "?"} {unit && <span className="text-sm text-slate-400 font-medium ml-1">{unit}</span>}
                          </h3>
                        </Link>
                        
                        <div className={theme.components.cardFooter + " mt-8"}>
                          <div className={theme.components.cardFooterItem}>
                            <span className={theme.components.cardFooterText}>
                              Actions
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {(itemCounts[valStr] || 0) === 0 ? (
                              <>
                                <button 
                                  onClick={() => { 
                                    setEditingId(item.id); 
                                    setEditValue(valStr); 
                                    setItemToDeleteId(null);
                                  }} 
                                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => {
                                    setItemToDeleteId(itemToDeleteId === item.id ? null : item.id);
                                    setEditingId(null);
                                  }} 
                                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-200 text-[8px] font-black uppercase tracking-widest text-slate-500">
                                <Lock className="w-2.5 h-2.5" />
                                Protected
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {itemToDeleteId === item.id && (
                    <InlineDeleteConfirmation 
                      itemName={typeof item.name === 'object' ? (item.name?.en || item.slug) : (item.name || item.slug)}
                      onConfirm={() => handleConfirmDelete(item.id)}
                      onCancel={() => setItemToDeleteId(null)}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
