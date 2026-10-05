"use client";

import React, { useState, useEffect, useCallback } from "react";
import { focusClient, graphClient, Highlight, EntityNode } from "@lib/core";
import { Star, Search, Trash2, Plus, ArrowRight, Settings, MapPin, Fuel, Calendar, Zap, LayoutTemplate, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CONFIG } from "@/lib/config";
import { SmartImage } from "@/app/components";

const FOCUS_TYPES = [
  { id: "hero_slider", label: "Hero Sliders", icon: ImageIcon },
  { id: "featured_vehicle", label: "Featured Vehicles", icon: Star },
  { id: "banner", label: "Banner Promotions", icon: LayoutTemplate }
];

export default function HighlightsPage() {
  const [activeTab, setActiveTab] = useState(FOCUS_TYPES[0].id);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<EntityNode[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load current highlights for active tab
  const loadHighlights = useCallback(async () => {
    setIsLoadingHighlights(true);
    try {
      const res = await focusClient.listHighlights({ type: activeTab, status: "" });
      setHighlights(res.highlights || []);
    } catch (err) {
      console.error("Failed to load highlights:", err);
    } finally {
      setIsLoadingHighlights(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadHighlights();
  }, [loadHighlights]);

  // Handle Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await graphClient.searchNodes({ 
          query: searchQuery, 
          types: ["model", "variant", "brand"], 
          limit: 10 
        });
        setSearchResults((res.nodes as any[]) || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400); // debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const markAsHighlight = async (node: EntityNode) => {
    const title = node.name?.en || node.name?.np || "Unknown Vehicle";
    const subtitle = node.tags?.join(" • ") || "Premium selection";
    const targetUrl = `/${node.slug}`; 
    
    let media = { values: [] };
    if (node.media && Array.isArray(node.media) && node.media.length > 0) {
      media = { values: node.media } as any;
    }

    try {
      await focusClient.saveHighlight({
        id: "", 
        type: activeTab,
        title,
        subtitle,
        targetUrl,
        media: media as any,
        metadata: { "node_id": node.id },
        status: "active",
        sortOrder: highlights.length + 1,
        startDate: new Date().toISOString(),
      });
      loadHighlights(); 
      setSearchQuery(""); 
    } catch (err) {
      console.error("Failed to mark highlight:", err);
      alert("Failed to save highlight.");
    }
  };

  const removeHighlight = async (id: string) => {
    if (!window.confirm("Remove this highlight from the homepage?")) return;
    try {
      await focusClient.deleteHighlight({ id });
      loadHighlights();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  // Extract Thumbnail
  const getThumbnail = (node: any) => {
    const mediaArray = node.media?.values || node.media || [];
    if (!Array.isArray(mediaArray) || mediaArray.length === 0) return null;
    const firstImg = mediaArray[0]?.structValue?.fields;
    if (!firstImg) return null;
    return `${CONFIG.MEDIA.API_URL}/${firstImg.type?.stringValue || 'gallery'}/${firstImg.id?.stringValue}`;
  };

  return (
    <div className="flex h-full flex-col bg-white">
      
      {/* Header & Tabs */}
      <div className="px-8 pt-8 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-xl z-20">
        <div className="flex gap-2">
          {FOCUS_TYPES.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery("");
              }}
              className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === tab.id 
                  ? "border-blue-600 text-blue-600 bg-blue-50/50" 
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-blue-600" : "text-slate-400"}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Active Highlights */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-slate-50 border-r border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Active {FOCUS_TYPES.find(t => t.id === activeTab)?.label}</h2>
            <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{highlights.length} Items</span>
          </div>

          {isLoadingHighlights ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : highlights.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-slate-200">
              <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="font-bold text-slate-500">No active highlights in this section.</p>
              <p className="text-sm text-slate-400 mt-2">Use the search panel to find and mark products.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {highlights.map((h, index) => (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-5 group"
                  >
                    <div className="w-8 font-black text-slate-300 text-2xl">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{h.title}</h3>
                      <p className="text-xs text-slate-500 truncate mt-1">{h.subtitle}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3 text-blue-400" /> {h.targetUrl}</span>
                        {h.startDate && (
                          <>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-blue-400" />
                              {new Date(h.startDate).toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeHighlight(h.id)}
                      className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                      title="Unmark Highlight"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right Side: Product Search */}
        <div className="w-full max-w-md bg-white flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Search Products</h2>
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isSearching ? "text-blue-600 animate-pulse" : "text-slate-400"}`} />
              <input 
                type="text" 
                placeholder="Search models, brands, variants..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-900 placeholder-slate-400 shadow-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {!searchQuery.trim() ? (
              <div className="text-center mt-10">
                <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400">Type to search the inventory...</p>
              </div>
            ) : searchResults.length === 0 && !isSearching ? (
              <div className="text-center mt-10">
                <p className="text-sm font-bold text-slate-400">No products found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map(node => {
                  // Check if already highlighted in THIS tab (using node_id embedded in metadata)
                  const isAlreadyHighlighted = highlights.some(
                    h => h.metadata && (h.metadata as any).node_id === node.id
                  );

                  const thumb = getThumbnail(node);

                  return (
                    <div key={node.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 items-center hover:border-blue-300 transition-colors shadow-sm group">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200 flex items-center justify-center">
                        {thumb ? (
                          <SmartImage src={thumb} alt="thumb" variant="thumbnail" fill className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">
                          {node.type}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm truncate">
                          {node.name?.en || node.name?.np || "Unnamed"}
                        </h4>
                      </div>

                      {isAlreadyHighlighted ? (
                        <div className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-bold rounded-lg flex items-center gap-1 border border-green-100">
                          <Star className="w-3.5 h-3.5 fill-green-500 text-green-500" /> Marked
                        </div>
                      ) : (
                        <button 
                          onClick={() => markAsHighlight(node)}
                          className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Mark as Highlight"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
