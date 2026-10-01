"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Trash2, Image as ImageIcon, Star } from "lucide-react";
import Image from "next/image";

export interface MediaItem {
  id: string;
  url: string;
  name?: string;
  type?: string;
  isCover?: boolean;
}

export interface MediaPreviewProps {
  items: MediaItem[];
  onRemove?: (id: string) => void;
  onSetCover?: (id: string) => void;
  gridClassName?: string;
}

export function MediaPreview({ 
  items, 
  onRemove, 
  onSetCover,
  gridClassName = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
}: MediaPreviewProps) {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  if (!items || items.length === 0) {
    return (
      <div className="w-full p-12 rounded-3xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-center">
        <ImageIcon className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No media available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className={`grid gap-4 ${gridClassName}`}>
        <AnimatePresence>
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              className={`group relative aspect-square rounded-2xl overflow-hidden border shadow-sm transition-all ${
                item.isCover ? "border-blue-500 ring-4 ring-blue-500/20" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Media Image */}
              <div 
                className="w-full h-full bg-slate-100 cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <img 
                  src={item.url} 
                  alt={item.name || "Media item"} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Cover Badge */}
              {item.isCover && (
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md flex items-center gap-1.5">
                  <Star className="w-3 h-3 fill-white" />
                  Cover
                </div>
              )}

              {/* Hover Actions */}
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-2">
                {onSetCover && !item.isCover && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onSetCover(item.id); }}
                    className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-xl text-white transition-colors"
                    title="Set as Cover"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                {onRemove && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                    className="p-2 bg-red-500/80 hover:bg-red-500 backdrop-blur-md rounded-xl text-white transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl max-h-full bg-slate-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <a 
                  href={selectedItem.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 min-h-0 bg-black flex items-center justify-center p-8">
                <img 
                  src={selectedItem.url} 
                  alt={selectedItem.name || "Preview"} 
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              </div>

              {selectedItem.name && (
                <div className="p-6 bg-slate-900 border-t border-white/10">
                  <h3 className="text-white font-bold truncate">{selectedItem.name}</h3>
                  <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">{selectedItem.type || 'Image'}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
