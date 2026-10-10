"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { 
  Image as ImageIcon, 
  Video, 
  Film, 
  Layers, 
  Search, 
  X, 
  RefreshCw, 
  UploadCloud, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Download, 
  LayoutGrid, 
  List as ListIcon, 
  Filter, 
  Car, 
  Shield, 
  Star, 
  Loader2, 
  Play, 
  Maximize2,
  FileText,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageLayout, PageContent, TopbarActions } from "@app/(protected)/console/components";
import { theme } from "@app/(protected)/console/theme";
import { SmartImage } from "@/app/components";
import { uploadMediaFiles, listMediaAssets, deleteMediaAsset } from "@/lib/media";
import { CONFIG } from "@/lib/config";
import { graphClient, EntityNode } from "@lib/core";
import { toJson } from "@bufbuild/protobuf";
import { ListValueSchema } from "@bufbuild/protobuf/wkt";

export interface UnifiedMediaAsset {
  id: string;
  name: string;
  url: string;
  mediaType: "image" | "video" | "audio" | "document";
  mimeType?: string;
  fileSize?: number;
  sourceType: "upload" | "brand" | "model" | "variant";
  entityName?: string;
  entitySlug?: string;
  entityHref?: string;
  isCover?: boolean;
  createdAt?: string;
}

export function isPngAsset(asset?: { name?: string; url?: string; mimeType?: string } | null): boolean {
  if (!asset) return false;
  if (asset.mimeType === "image/png") return true;
  const name = (asset.name || "").toLowerCase();
  const url = (asset.url || "").toLowerCase();
  return (
    name.endsWith(".png") ||
    url.endsWith(".png") ||
    name.includes(".png?") ||
    url.includes(".png?") ||
    url.includes("image/png")
  );
}

function parseNodeMedia(media: any): any[] {
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
    return val;
  };

  const results: any[] = [];
  for (let idx = 0; idx < rawList.length; idx++) {
    const unwrapped = unwrapValue(rawList[idx]);
    if (typeof unwrapped === "string") {
      results.push({
        id: `graph-media-${idx}`,
        url: unwrapped,
        name: `Asset ${idx + 1}`,
        type: "gallery",
        isCover: idx === 0,
      });
    } else if (unwrapped && typeof unwrapped === "object" && unwrapped.url) {
      results.push({
        id: String(unwrapped.id || `graph-media-${idx}`),
        url: String(unwrapped.url),
        name: String(unwrapped.name || unwrapped.originalName || "Vehicle Media"),
        type: String(unwrapped.type || "gallery"),
        isCover: Boolean(unwrapped.isCover),
      });
    }
  }
  return results;
}

function detectMediaType(url: string, mime?: string, originalName?: string): "image" | "video" | "audio" | "document" {
  const check = (url + " " + (originalName || "")).toLowerCase();
  if (mime) {
    if (mime.startsWith("video/")) return "video";
    if (mime.startsWith("audio/")) return "audio";
    if (mime.startsWith("image/")) return "image";
    if (mime.includes("pdf") || mime.includes("document") || mime.includes("sheet")) return "document";
  }
  if (check.match(/\.(mp4|mov|webm|mkv|avi|m4v)(\?.*)?$/)) return "video";
  if (check.match(/\.(mp3|wav|ogg|flac|aac)(\?.*)?$/)) return "audio";
  if (check.match(/\.(pdf|doc|docx|xls|xlsx)(\?.*)?$/)) return "document";
  return "image";
}

export default function MediaControlCenterPage() {
  const [assets, setAssets] = useState<UnifiedMediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTypeTab, setActiveTypeTab] = useState<"all" | "image" | "video">("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | "upload" | "variant" | "model" | "brand">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showUploader, setShowUploader] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<UnifiedMediaAsset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<UnifiedMediaAsset | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadAllMedia = async () => {
    setIsLoading(true);
    const unifiedMap = new Map<string, UnifiedMediaAsset>();

    try {
      // 1. Fetch direct uploaded assets from the Media service REST endpoint
      const mediaRes = await listMediaAssets({ limit: 100 });
      if (mediaRes && Array.isArray(mediaRes.assets)) {
        for (const item of mediaRes.assets) {
          const type = detectMediaType(item.url, item.mime_type || item.mimeType, item.original_name || item.originalName);
          unifiedMap.set(item.id, {
            id: item.id,
            name: item.original_name || item.originalName || "Uploaded Media",
            url: item.url,
            mediaType: type,
            mimeType: item.mime_type || item.mimeType,
            fileSize: item.file_size,
            sourceType: "upload",
            entityName: "Media Storage",
          });
        }
      }
    } catch (err) {
      console.warn("Media service listing skipped or unavailable:", err);
    }

    try {
      // 2. Fetch vehicle nodes from Knowledge Graph to harvest attached media
      const graphRes = await graphClient.searchNodes({
        query: "",
        types: ["Brand", "Model", "Variant"],
        limit: 100,
        vector: [],
      });

      if (graphRes && Array.isArray(graphRes.nodes)) {
        for (const node of graphRes.nodes) {
          const nodeMedia = parseNodeMedia(node.media);
          if (nodeMedia.length === 0) continue;

          const nodeType = (node.type || "variant").toLowerCase() as "brand" | "model" | "variant";
          const rawName = (node.name as any)?.en || (node.name as any)?.default || node.slug;
          
          let entityHref: string | undefined = undefined;
          if (nodeType === "brand") {
            entityHref = `/console/brand/${node.slug}/detail`;
          }

          nodeMedia.forEach((m, idx) => {
            const assetKey = m.id && m.id !== `graph-media-${idx}` ? m.id : `${node.slug}-${idx}-${m.url}`;
            if (!unifiedMap.has(assetKey)) {
              const type = detectMediaType(m.url, undefined, m.name);
              unifiedMap.set(assetKey, {
                id: assetKey,
                name: m.name || `${rawName} Media`,
                url: m.url,
                mediaType: type,
                sourceType: nodeType,
                entityName: rawName,
                entitySlug: node.slug,
                entityHref: entityHref,
                isCover: m.isCover,
              });
            }
          });
        }
      }
    } catch (err) {
      console.warn("Knowledge graph media search skipped or unavailable:", err);
    }

    setAssets(Array.from(unifiedMap.values()));
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllMedia();
  }, []);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Type Filter
      if (activeTypeTab !== "all" && asset.mediaType !== activeTypeTab) {
        return false;
      }
      // Source Filter
      if (sourceFilter !== "all" && asset.sourceType !== sourceFilter) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (asset.name || "").toLowerCase().includes(q);
        const matchesEntity = (asset.entityName || "").toLowerCase().includes(q);
        const matchesUrl = (asset.url || "").toLowerCase().includes(q);
        if (!matchesName && !matchesEntity && !matchesUrl) return false;
      }
      return true;
    });
  }, [assets, activeTypeTab, sourceFilter, searchQuery]);

  // Metric counts
  const totalCount = assets.length;
  const imageCount = useMemo(() => assets.filter((a) => a.mediaType === "image").length, [assets]);
  const videoCount = useMemo(() => assets.filter((a) => a.mediaType === "video").length, [assets]);

  // Upload handler
  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = fileArray.map(async (f) => {
        const res = await uploadMediaFiles([f], "auto");
        const payload = res.data || res;
        return Array.isArray(payload) ? payload[0] : (payload.asset || payload);
      });

      const uploadedResults = await Promise.all(uploadPromises);

      const newItems: UnifiedMediaAsset[] = uploadedResults.map((asset, idx) => {
        const assetId = asset?.id || `${Date.now()}-${idx}`;
        const assetUrl = asset?.url || `${CONFIG.MEDIA.API_URL}/image/original/${assetId}`;
        const type = detectMediaType(assetUrl, fileArray[idx].type, fileArray[idx].name);
        return {
          id: assetId,
          name: asset?.original || asset?.name || fileArray[idx].name,
          url: assetUrl,
          mediaType: type,
          mimeType: fileArray[idx].type,
          fileSize: fileArray[idx].size,
          sourceType: "upload",
          entityName: "Direct Upload",
        };
      });

      setAssets((prev) => [...newItems, ...prev]);
      setShowUploader(false);
      showToast(`${fileArray.length} asset(s) successfully uploaded!`);
    } catch (err) {
      console.error("Failed to upload media:", err);
      alert("Failed to upload media asset. Please check network connectivity.");
    } finally {
      setIsUploading(false);
    }
  };

  // Copy URL to Clipboard
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast("Direct URL copied to clipboard!");
  };

  // Delete Asset
  const confirmDelete = async () => {
    if (!assetToDelete) return;
    try {
      if (assetToDelete.sourceType === "upload") {
        await deleteMediaAsset(assetToDelete.id);
      }
      setAssets((prev) => prev.filter((a) => a.id !== assetToDelete.id));
      if (selectedAsset?.id === assetToDelete.id) {
        setSelectedAsset(null);
      }
      setAssetToDelete(null);
      showToast("Media asset deleted successfully.");
    } catch (err) {
      console.error("Failed to delete asset:", err);
      alert("Failed to delete asset from media service.");
    }
  };

  return (
    <PageLayout className={theme.layout.pageContainer}>
      <TopbarActions>
        <div className="flex items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative flex items-center">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Filter media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-900 outline-none w-36 sm:w-48 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid" ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "table" ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-900"
              }`}
              title="List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadAllMedia}
            disabled={isLoading}
            className={theme.buttons.icon}
            title="Reload Media Registry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-slate-400" : ""}`} />
          </button>

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => setShowUploader((prev) => !prev)}
            className={theme.buttons.primary}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{showUploader ? "Close Uploader" : "Upload Media"}</span>
          </button>
        </div>
      </TopbarActions>

      <PageContent className={`${theme.layout.contentWrapper} relative`}>
        {/* Subtle Ambient Highlight Effect (matching console) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-blue-500/[0.06] rounded-full blur-[120px]" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] bg-blue-400/[0.04] rounded-full blur-[120px]" />
        </div>
        {/* Floating Success Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 p-3.5 bg-emerald-600 text-white font-bold text-xs rounded-2xl flex items-center gap-2.5 max-w-md"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsible Upload Dropzone Card */}
        <AnimatePresence>
          {showUploader && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2.5">
                      <UploadCloud className="w-4 h-4 text-slate-700" />
                      Upload Images & Videos to Central Media Storage
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 font-normal">
                      Drag & drop images (JPG, PNG, WEBP) or video clips (MP4, WEBM). Assets are processed and stored in Cloudflare R2.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUploader(false)}
                    className="text-slate-400 hover:text-slate-600 p-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {isUploading ? (
                  <div className="h-48 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                    <Loader2 className="w-8 h-8 text-slate-700 animate-spin" />
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Uploading & Ingesting Assets...
                    </p>
                    <p className="text-[11px] text-slate-400">Saving files to Cloudflare R2 and registering metadata</p>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files);
                    }}
                    className="p-12 border-2 border-dashed border-slate-300 hover:border-slate-800 bg-slate-50/50 hover:bg-white rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center text-center space-y-3 group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => {
                        if (e.target.files) handleFileUpload(e.target.files);
                      }}
                      className="hidden"
                    />
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:scale-105 group-hover:text-slate-900 transition-all">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Click to browse or drop media files here
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">
                        Supported: PNG, JPEG, WEBP, AVIF, MP4, WEBM • Up to 100MB per file
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter & Subheader Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2.5">
              <div className="w-6 h-[2px] bg-slate-400" />
              Media Repository ({filteredAssets.length})
            </h2>
            {isLoading && (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                Scanning Registry...
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Media Type Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTypeTab("all")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTypeTab === "all" ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                All ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTypeTab("image")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTypeTab === "image" ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <ImageIcon className="w-3 h-3 text-blue-500" />
                Images ({imageCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTypeTab("video")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTypeTab === "video" ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Video className="w-3 h-3 text-purple-500" />
                Videos ({videoCount})
              </button>
            </div>

            {/* Source Filter Dropdown */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-1.5 outline-none hover:bg-slate-50 transition-all cursor-pointer"
            >
              <option value="all">All Sources</option>
              <option value="upload">Direct Uploads</option>
              <option value="variant">Vehicle Variants</option>
              <option value="model">Vehicle Models</option>
              <option value="brand">Brand Assets</option>
            </select>
          </div>
        </div>

        {/* Media Asset Presentation */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-video bg-white border border-slate-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredAssets.length > 0 ? (
          viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-3xl overflow-hidden transition-all flex flex-col cursor-pointer"
                  onClick={() => setSelectedAsset(asset)}
                >
                  {/* Thumbnail / Visual Viewport */}
                  <div className={`relative aspect-video w-full overflow-hidden flex items-center justify-center border-b border-slate-200 ${
                    isPngAsset(asset) ? "bg-transparency-grid" : "bg-slate-900"
                  }`}>
                    {asset.mediaType === "video" ? (
                      <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                        <video
                          src={asset.url}
                          muted
                          preload="metadata"
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/40 group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        </div>
                      </div>
                    ) : (
                      <SmartImage
                        src={asset.url}
                        alt={asset.name}
                        variant="medium"
                        fill
                        className={`w-full h-full ${
                          isPngAsset(asset) ? "object-contain p-3" : "object-cover"
                        } group-hover:scale-105 transition-transform duration-500`}
                      />
                    )}

                    {/* Format Pill */}
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white border border-white/10 flex items-center gap-1">
                      {asset.mediaType === "video" ? (
                        <>
                          <Video className="w-2.5 h-2.5 text-purple-300" />
                          <span>Video</span>
                        </>
                      ) : isPngAsset(asset) ? (
                        <>
                          <ImageIcon className="w-2.5 h-2.5 text-emerald-300" />
                          <span>PNG</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-2.5 h-2.5 text-blue-300" />
                          <span>Image</span>
                        </>
                      )}
                    </div>

                    {/* Cover Pill if flagged */}
                    {asset.isCover && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-amber-500/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        <span>Cover</span>
                      </div>
                    )}

                    {/* Quick Hover Controls */}
                    <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(asset.url);
                        }}
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md transition-colors"
                        title="Copy direct URL"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(asset.url, "_blank");
                        }}
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssetToDelete(asset);
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white backdrop-blur-md transition-colors"
                        title="Delete asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Info Footer */}
                  <div className="p-5 flex flex-col justify-between flex-1 space-y-3 bg-transparent">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate" title={asset.name}>
                        {asset.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                        {asset.id}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 text-[10px]">
                      {/* Source attribution badge */}
                      <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 text-[9px] font-mono font-bold uppercase tracking-wider truncate max-w-[140px]">
                        {asset.entityName || asset.sourceType}
                      </span>
                      <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-500 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider">
                        {asset.mediaType}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Media List Component matching console */
            <div className="space-y-4">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex items-center gap-6 hover:bg-slate-100 transition-all cursor-pointer group"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center border border-slate-200 overflow-hidden shrink-0 relative ${
                    isPngAsset(asset) ? "bg-transparency-grid-sm p-1.5" : "bg-slate-900"
                  }`}>
                    {asset.mediaType === "video" ? (
                      <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                        <video src={asset.url} muted className="w-full h-full object-cover opacity-80" />
                        <Play className="w-3.5 h-3.5 text-white absolute" />
                      </div>
                    ) : (
                      <SmartImage
                        src={asset.url}
                        alt={asset.name}
                        variant="thumbnail"
                        fill
                        className={isPngAsset(asset) ? "object-contain" : "object-cover"}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-600 font-semibold truncate">
                      <span className="text-slate-900 font-bold group-hover:text-blue-600 transition-colors">{asset.name}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2 truncate">
                      <span>{asset.entityName || asset.sourceType || "Media Registry"}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-400">{asset.id}</span>
                      {asset.fileSize && (
                        <>
                          <span>•</span>
                          <span>{(asset.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <div className="px-3 py-1.5 bg-white text-slate-500 rounded-lg text-[9px] font-mono border border-slate-200 uppercase font-bold tracking-wider">
                      {isPngAsset(asset) ? "PNG" : asset.mediaType}
                    </div>
                    {asset.entityName && (
                      <div className="hidden sm:block px-3 py-1.5 bg-white text-slate-600 rounded-lg text-[9px] font-mono border border-slate-200 uppercase font-bold tracking-wider truncate max-w-[160px]">
                        {asset.entityName}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(asset.url)}
                        className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        title="Copy direct URL"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setAssetToDelete(asset)}
                        className="p-2 bg-white rounded-xl border border-slate-200 text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Delete asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Empty State */
          <div className="p-20 rounded-3xl border border-dashed border-slate-300 bg-white text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
              <ImageIcon className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">No media assets found</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
                {searchQuery || activeTypeTab !== "all" || sourceFilter !== "all"
                  ? "No files match your active search or filters. Clear your filters to view all assets."
                  : "Upload photos and video clips to establish your central vehicle media repository."}
              </p>
            </div>
            {!showUploader && (
              <button
                type="button"
                onClick={() => setShowUploader(true)}
                className={`${theme.buttons.primary} mx-auto mt-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Upload Media Assets</span>
              </button>
            )}
          </div>
        )}

        {/* Lightbox / Asset Inspector Modal */}
        <AnimatePresence>
          {selectedAsset && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
              onClick={() => setSelectedAsset(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 text-white rounded-3xl max-w-5xl w-full overflow-hidden border border-slate-800 flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                      {selectedAsset.mediaType === "video" ? <Video className="w-4 h-4 text-purple-400" /> : <ImageIcon className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white truncate max-w-md">{selectedAsset.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">{selectedAsset.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedAsset.url)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <a
                      href={selectedAsset.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Open full resolution"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setSelectedAsset(null)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Media Viewport */}
                <div className={`flex-1 flex items-center justify-center min-h-[360px] max-h-[60vh] overflow-hidden relative p-4 ${
                  isPngAsset(selectedAsset) ? "bg-transparency-grid" : "bg-black"
                }`}>
                  {selectedAsset.mediaType === "video" ? (
                    <video
                      src={selectedAsset.url}
                      controls
                      autoPlay
                      className="max-h-[60vh] max-w-full w-auto object-contain"
                    />
                  ) : (
                    <img
                      src={selectedAsset.url}
                      alt={selectedAsset.name}
                      className="max-h-[56vh] max-w-full w-auto object-contain"
                    />
                  )}
                </div>

                {/* Asset Metadata Footer */}
                <div className="p-6 bg-slate-950 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Type</span>
                    <span className="text-slate-200 font-semibold capitalize mt-0.5 block">{selectedAsset.mediaType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Source Node</span>
                    <span className="text-slate-200 font-semibold capitalize mt-0.5 block">{selectedAsset.entityName || selectedAsset.sourceType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Storage Provider</span>
                    <span className="text-slate-200 font-semibold mt-0.5 block">Cloudflare R2 Bucket</span>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setAssetToDelete(selectedAsset);
                      }}
                      className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-[11px] rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Asset</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {assetToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setAssetToDelete(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 space-y-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Delete Media Asset?</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Are you sure you want to delete <strong className="text-slate-800">"{assetToDelete.name}"</strong>? This will remove the file from storage.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAssetToDelete(null)}
                    className={`${theme.buttons.secondary} flex-1`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className={`${theme.buttons.danger} flex-1`}
                  >
                    Delete Permanently
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </PageContent>
    </PageLayout>
  );
}
