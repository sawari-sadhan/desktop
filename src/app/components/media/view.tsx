"use client";

import React, { useState } from "react";
import NextImage, { ImageProps as NextImageProps } from "next/image";
import { Loader2, ImageOff, X, ExternalLink, Trash2, Image as ImageIcon, Star } from "lucide-react";
import { CONFIG } from "@lib/config";
import { motion, AnimatePresence } from "framer-motion";
import { InlineDeleteConfirmation } from "../confirmation/delete";

// ==========================================
// Smart Image (Responsive / Optimized)
// ==========================================
export interface SmartImageProps extends Omit<NextImageProps, 'src' | 'alt' | 'sizes'> {
  src: string;
  alt: string;
  variant?: 'thumbnail' | 'medium' | 'large' | 'full';
  className?: string;
  fallbackSrc?: string;
}

const variantSizes = {
  thumbnail: "(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw", // For small grid cards
  medium: "(max-width: 768px) 100vw, 50vw", // For half-screen images
  large: "(max-width: 1024px) 100vw, 75vw", // For hero or featured sections
  full: "100vw", // Full screen widths
};

export const SmartImage = ({ 
  src, 
  alt, 
  variant = 'medium', 
  className = "", 
  fallbackSrc,
  ...props 
}: SmartImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const sizes = variantSizes[variant];

  const isExternal = src.startsWith('http://') || src.startsWith('https://') || src.startsWith('blob:') || src.startsWith('data:');
  const finalSrc = isExternal ? src : `${CONFIG.MEDIA.API_URL}${src.startsWith('/') ? '' : '/'}${src}`;

  if (hasError) {
    if (fallbackSrc) {
      return (
        <NextImage 
          src={fallbackSrc}
          alt={alt}
          sizes={sizes}
          className={`object-cover ${className}`}
          {...props}
        />
      );
    }
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100 text-slate-400 ${className}`}>
        <ImageOff className="w-6 h-6 mb-2 opacity-50" />
        <span className="text-[10px] font-black uppercase tracking-widest">Image Unavailable</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${props.fill ? 'w-full h-full' : ''} ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center z-10">
          <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
        </div>
      )}
      
      <NextImage
        src={finalSrc}
        alt={alt}
        sizes={sizes}
        unoptimized={finalSrc.includes('localhost') || finalSrc.includes('127.0.0.1')}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={`transition-opacity duration-500 object-cover ${
          isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
        }`}
        {...props}
      />
    </div>
  );
};

// ==========================================
// Media Preview Gallery
// ==========================================
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
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);

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
              className={`group relative aspect-square rounded-2xl overflow-hidden border transition-all ${
                item.isCover ? "border-blue-500 ring-4 ring-blue-500/20 bg-slate-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              {/* Media Image */}
              <div 
                className={`w-full h-full ${(item.url?.toLowerCase().includes(".png") || item.name?.toLowerCase().includes(".png")) ? "bg-transparency-grid-sm p-1.5" : "bg-slate-100"} cursor-pointer`}
                onClick={() => setSelectedItem(item)}
              >
                <SmartImage 
                  src={item.url} 
                  alt={item.name || "Media item"} 
                  variant="thumbnail"
                  fill
                  className={`w-full h-full ${(item.url?.toLowerCase().includes(".png") || item.name?.toLowerCase().includes(".png")) ? "object-contain" : "object-cover"} transition-transform duration-500 group-hover:scale-105`}
                />
              </div>

              {/* Cover Badge */}
              {item.isCover && (
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5">
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
                    onClick={(e) => { e.stopPropagation(); setItemToDelete(item); }}
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
              className="relative w-full max-w-5xl max-h-full bg-slate-950 rounded-3xl overflow-hidden flex flex-col"
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

              <div className={`flex-1 min-h-0 ${(selectedItem.url?.toLowerCase().includes(".png") || selectedItem.name?.toLowerCase().includes(".png")) ? "bg-transparency-grid" : "bg-black"} flex items-center justify-center p-8`}>
                <div className="relative w-full h-[70vh]">
                  <SmartImage 
                    src={selectedItem.url} 
                    alt={selectedItem.name || "Preview"} 
                    variant="full"
                    fill
                    className="object-contain"
                  />
                </div>
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-12"
            onClick={() => setItemToDelete(null)}
          >
            <div 
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <InlineDeleteConfirmation
                itemName={itemToDelete.name || "Media"}
                onCancel={() => setItemToDelete(null)}
                onConfirm={() => {
                  if (onRemove) onRemove(itemToDelete.id);
                  setItemToDelete(null);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
