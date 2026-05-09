"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Check, X, Search, Loader2, CheckCircle2, Workflow, Activity, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { entityApi, EntityNode } from "$lib/v1/graph/entity";
import { InlineDeleteConfirmation } from "@/app/components/confirmation/delete";

interface StringEditorProps {
  attributeCode: string;
  name: string;
}

export const StringEditor = ({ attributeCode, name }: StringEditorProps) => {
  const [items, setItems] = useState<EntityNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
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
      const nodes = await entityApi.listByType(attributeCode);
      setItems(nodes);

      // 2. Count Active Deployments across all Releases
      const allReleases = await entityApi.listByType('release');
      const counts: Record<string, number> = {};
      
      allReleases.forEach(release => {
        if (!release.data) return;
        Object.values(release.data).forEach((section: any) => {
          if (!section || typeof section !== 'object') return;
          const val = section[attributeCode];
          if (val !== undefined && val !== null) {
            const valStr = val.toString();
            counts[valStr] = (counts[valStr] || 0) + 1;
          }
        });
      });
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
    if (!newItem.trim()) return;
    setIsSubmitting(true);
    try {
      const slug = `${attributeCode}-${newItem.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
      const newNode = await entityApi.create({
        type: attributeCode,
        slug: slug,
        name: { en: newItem.trim() },
        description: { en: `Instance of ${name}` }
      });
      setItems([...items, newNode]);
      setNewItem("");
      setSuccessMessage(`"${newItem}" added to registry`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to create node:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async (id: string) => {
    if (!editValue.trim()) return;
    setIsSubmitting(true);
    try {
      await entityApi.update(id, {
        name: { en: editValue.trim() }
      });
      setItems(items.map(item => item.id === id ? { ...item, name: { ...item.name, en: editValue.trim() } } : item));
      setEditingId(null);
      setSuccessMessage(`Entry updated to "${editValue}"`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update node:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      await entityApi.delete(id);
      setItems(items.filter(item => item.id !== id));
      setSuccessMessage("Entry removed from registry");
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
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-2 rounded-full flex items-center gap-3 shadow-2xl backdrop-blur-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Edit2 className="w-4 h-4 text-slate-500" />
          {name} Node Registry
        </h2>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {isLoading ? "Loading..." : `${items.length} Entries`}
        </span>
      </div>

      {/* Add New */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            disabled={isSubmitting}
            placeholder={`Add new ${name.toLowerCase()} option...`}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-sm text-white focus:ring-1 focus:ring-white/20 transition-all disabled:opacity-50"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={isSubmitting || !newItem.trim()}
          className="px-6 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-6 h-6 text-slate-700 animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex flex-col group hover:border-white/10 transition-all"
              >
                <div className="flex items-center justify-between w-full">
                  {editingId === item.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl py-1 px-3 text-sm text-white focus:outline-none"
                        autoFocus
                      />
                      <button onClick={() => handleSave(item.id)} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link 
                        href={`/console/attribute/${attributeCode}/list?value=${encodeURIComponent(typeof item.name === 'object' ? (item.name?.en || "") : (item.name || ""))}`}
                        className="flex flex-col flex-1 group/item cursor-pointer"
                      >
                        <span className="text-sm text-slate-300 font-medium group-hover/item:text-emerald-400 transition-colors">
                          {typeof item.name === 'object' ? (item.name?.en || "Unnamed") : (item.name || "Unnamed")}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase mt-1">{item.slug}</span>
                      </Link>
                      <div className="w-24 flex justify-end items-center relative">
                        {/* Deployment Count (Visible by default) */}
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 rounded-full border border-emerald-500/10 group-hover:hidden transition-all">
                          <Workflow className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                            {itemCounts[typeof item.name === 'object' ? (item.name?.en || "") : (item.name || "")] || 0}
                          </span>
                        </div>

                        {/* Actions (Visible on hover) */}
                        <div className="hidden group-hover:flex items-center gap-1">
                          {(itemCounts[typeof item.name === 'object' ? (item.name?.en || "") : (item.name || "")] || 0) === 0 ? (
                            <>
                              <button 
                                onClick={() => {
                                  setEditingId(item.id);
                                  setEditValue(typeof item.name === 'object' ? (item.name?.en || "") : (item.name || ""));
                                  setItemToDeleteId(null);
                                }} 
                                className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => {
                                  setItemToDeleteId(itemToDeleteId === item.id ? null : item.id);
                                  setEditingId(null);
                                }} 
                                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/5 rounded-lg transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[8px] font-black uppercase tracking-widest text-slate-600">
                              <Lock className="w-2.5 h-2.5" />
                              Protected
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {itemToDeleteId === item.id && (
                  <InlineDeleteConfirmation 
                    itemName={typeof item.name === 'object' ? (item.name?.en || item.slug) : (item.name || item.slug)}
                    onConfirm={() => handleConfirmDelete(item.id)}
                    onCancel={() => setItemToDeleteId(null)}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
