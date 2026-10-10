"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  Image as ImageIcon, 
  Loader2, 
  Star, 
  Trash2, 
  UploadCloud, 
  CheckCircle2, 
  Layers, 
  Filter 
} from "lucide-react";
import { graphClient, EntityNode } from "@lib/core";
import { MediaUploader, MediaPreview, MediaItem } from "@/app/components";
import { uploadMediaFiles } from "@/lib/media";
import { CONFIG } from "@/lib/config";
import { fromJson, toJson } from "@bufbuild/protobuf";
import { ListValueSchema } from "@bufbuild/protobuf/wkt";
import { motion, AnimatePresence } from "framer-motion";

function parseNodeMedia(media: any): MediaItem[] {
  if (!media) return [];
  
  let rawList: any[] = [];
  if (Array.isArray(media)) {
    rawList = media;
  } else if (media.values && Array.isArray(media.values)) {
    rawList = media.values;
  } else if (media.listValue?.values && Array.isArray(media.listValue.values)) {
    rawList = media.listValue.values;
  } else {
    try {
      rawList = (toJson(ListValueSchema, media as any) as any[]) || [];
    } catch {
      rawList = [];
    }
  }

  const unwrapValue = (val: any): any => {
    if (!val || typeof val !== "object") return val;
    if ("stringValue" in val) return val.stringValue;
    if ("numberValue" in val) return val.numberValue;
    if ("boolValue" in val) return val.boolValue;
    if ("structValue" in val) return unwrapValue(val.structValue);
    if ("fields" in val && typeof val.fields === "object") {
      const res: Record<string, any> = {};
      for (const [k, v] of Object.entries(val.fields)) {
        res[k] = unwrapValue(v);
      }
      return res;
    }
    if ("kind" in val && val.kind && typeof val.kind === "object") {
      if (val.kind.case === "structValue") return unwrapValue(val.kind.value);
      if (val.kind.case === "stringValue") return val.kind.value;
      if (val.kind.case === "boolValue") return val.kind.value;
      if (val.kind.case === "numberValue") return val.kind.value;
    }
    return val;
  };

  const results: MediaItem[] = [];
  for (let idx = 0; idx < rawList.length; idx++) {
    const unwrapped = unwrapValue(rawList[idx]);
    if (typeof unwrapped === "string") {
      results.push({
        id: `media-${idx}`,
        url: unwrapped,
        name: `Image ${idx + 1}`,
        type: "gallery",
        isCover: idx === 0,
      });
    } else if (unwrapped && typeof unwrapped === "object" && unwrapped.url) {
      results.push({
        id: String(unwrapped.id || `media-${idx}`),
        url: String(unwrapped.url),
        name: String(unwrapped.name || unwrapped.originalName || "Uploaded Media"),
        type: String(unwrapped.type || "gallery"),
        isCover: Boolean(unwrapped.isCover),
      });
    }
  }

  return results;
}

export default function ModelMediaPage() {
  const params = useParams();
  const modelSlug = params.modelSlug as string;
  const brandSlug = params.slug as string;

  const [model, setModel] = useState<EntityNode | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadType, setUploadType] = useState<"gallery" | "featured">("gallery");
  const [filterType, setFilterType] = useState<"all" | "featured" | "gallery">("all");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const loadData = async () => {
    if (!modelSlug) return;
    setIsLoading(true);
    try {
      const res = await graphClient.getNode({ id: "", slug: modelSlug });
      if (res.node && res.node.id) {
        const m: EntityNode = {
          id: res.node.id,
          type: res.node.type,
          slug: res.node.slug,
          name: res.node.name || {},
          description: res.node.description || {},
          tags: res.node.tags || [],
          metadata: res.node.metadata || {},
          data: res.node.data || {},
          updated_at: res.node.updatedAt,
          media: (res.node.media as any) || []
        };
        setModel(m);
        setMediaItems(parseNodeMedia(res.node.media));
      }
    } catch (err) {
      console.error("Failed to load model media:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [modelSlug]);

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const persistMediaToGraph = async (updatedMedia: MediaItem[]) => {
    if (!model) return;
    setIsUpdating(true);
    try {
      const protoList = fromJson(ListValueSchema, updatedMedia as any);
      await graphClient.updateNode({
        id: model.id,
        name: model.name,
        description: model.description,
        tags: model.tags,
        metadata: model.metadata,
        data: model.data,
        media: protoList as any,
        embedding: []
      });
      setMediaItems(updatedMedia);
    } catch (err) {
      console.error("Failed to update model media in graph:", err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUploadMedia = async (uploadedFiles: File[]) => {
    if (!model || uploadedFiles.length === 0) return;
    setIsUpdating(true);
    try {
      const uploadPromises = uploadedFiles.map(async (file) => {
        const res = await uploadMediaFiles([file], uploadType);
        const payload = res.data || res;
        return Array.isArray(payload) ? payload[0] : (payload.asset || payload);
      });

      const uploadedAssets = await Promise.all(uploadPromises);

      const newItems: MediaItem[] = uploadedAssets.map((asset, idx) => {
        const assetId = asset?.id || `${Date.now()}-${idx}`;
        const assetUrl = asset?.url || `${CONFIG.MEDIA.API_URL}/image/original/${assetId}`;
        const isCover = uploadType === "featured" || (mediaItems.length === 0 && idx === 0);
        return {
          id: assetId,
          url: assetUrl,
          type: uploadType,
          isCover: isCover,
          name: asset?.original || asset?.name || uploadedFiles[idx]?.name || "Uploaded Media"
        };
      });

      let current = [...mediaItems];
      if (newItems.some(i => i.isCover)) {
        current = current.map(item => ({ ...item, isCover: false }));
      }

      const merged = [...current, ...newItems];
      await persistMediaToGraph(merged);
      showNotification(`${uploadedFiles.length} file(s) uploaded successfully!`);
    } catch (err) {
      console.error("Failed to upload media:", err);
      alert("Failed to upload media. Please check service connectivity.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveMedia = async (mediaId: string) => {
    try {
      const updated = mediaItems.filter(m => m.id !== mediaId);
      if (!updated.some(m => m.isCover) && updated.length > 0) {
        updated[0].isCover = true;
      }
      await persistMediaToGraph(updated);
      showNotification("Asset removed successfully.");
    } catch (err) {
      console.error("Failed to remove media asset:", err);
    }
  };

  const handleSetCover = async (mediaId: string) => {
    try {
      const updated = mediaItems.map(m => ({
        ...m,
        isCover: m.id === mediaId,
        type: m.id === mediaId ? "featured" : (m.type === "featured" ? "gallery" : m.type)
      }));
      await persistMediaToGraph(updated);
      showNotification("Cover photo updated!");
    } catch (err) {
      console.error("Failed to update cover photo:", err);
    }
  };

  const filteredItems = mediaItems.filter(item => {
    if (filterType === "featured") return item.isCover || item.type === "featured";
    if (filterType === "gallery") return !item.isCover && item.type !== "featured";
    return true;
  });

  const coverItem = mediaItems.find(m => m.isCover);
  const modelDisplayName = (model?.name as any)?.en || (model?.name as any)?.default || modelSlug;

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
              Model Media
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              {brandSlug.replace(/-/g, " ")}
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isLoading ? "Loading..." : modelDisplayName}
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Manage high-resolution gallery images and the primary featured cover photo for this model
          </p>
        </div>

        {/* Media Summary Stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Assets</p>
              <p className="text-base font-black text-slate-800 leading-tight">
                {mediaItems.length} <span className="text-xs font-bold text-slate-400">files</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
              coverItem ? "bg-amber-50 text-amber-600" : "bg-slate-200/60 text-slate-400"
            }`}>
              <Star className={`w-5 h-5 ${coverItem ? "fill-amber-500" : ""}`} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cover Photo</p>
              <p className="text-xs font-black text-slate-800 leading-tight">
                {coverItem ? "Configured" : "None"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Success Feedback */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center gap-2.5 max-w-md mx-auto"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{feedbackMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Zone Card */}
      <div className="bg-white border border-slate-200/90 shadow-sm p-8 lg:p-10 rounded-[2.5rem] space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 flex items-center gap-2.5">
              <UploadCloud className="w-5 h-5 text-indigo-600" />
              Upload Media Assets
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Select upload category then drag and drop or browse files
            </p>
          </div>

          {/* Upload Category Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setUploadType("gallery")}
              className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition-all ${
                uploadType === "gallery"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Gallery Photo
            </button>
            <button
              type="button"
              onClick={() => setUploadType("featured")}
              className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition-all flex items-center gap-1.5 ${
                uploadType === "featured"
                  ? "bg-white text-amber-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              Featured Cover
            </button>
          </div>
        </div>

        {isUpdating ? (
          <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-xs font-black text-slate-600 uppercase tracking-widest">
              Processing & Ingesting Media...
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Uploading to Cloudflare R2 and updating Knowledge Graph</p>
          </div>
        ) : (
          <MediaUploader 
            onUpload={handleUploadMedia} 
            maxFiles={10} 
            maxSizeMB={20} 
            acceptedTypes={["image/jpeg", "image/png", "image/webp", "image/avif"]}
          />
        )}
      </div>

      {/* Gallery Showcase Card */}
      <div className="bg-white border border-slate-200/90 shadow-sm p-8 lg:p-10 rounded-[2.5rem] space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-indigo-600" />
              Model Gallery ({mediaItems.length})
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Click any image to view full resolution. Hover over cards to set as cover or remove.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All ({mediaItems.length})
            </button>
            <button
              onClick={() => setFilterType("featured")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === "featured"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Cover ({mediaItems.filter(i => i.isCover || i.type === "featured").length})
            </button>
            <button
              onClick={() => setFilterType("gallery")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === "gallery"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Gallery ({mediaItems.filter(i => !i.isCover && i.type !== "featured").length})
            </button>
          </div>
        </div>

        {/* Media Grid or Empty State */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <MediaPreview 
            items={filteredItems}
            onRemove={handleRemoveMedia}
            onSetCover={handleSetCover}
            gridClassName="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          />
        ) : (
          <div className="py-20 text-center space-y-3 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-600 font-bold text-sm">No media items found</p>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              {filterType !== "all" 
                ? "No media matches the selected filter. Try selecting 'All' above." 
                : "Upload images above to create a photo gallery for this model."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
