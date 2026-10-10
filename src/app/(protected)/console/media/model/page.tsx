"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Folder, 
  FolderOpen, 
  Car, 
  Image as ImageIcon, 
  Video, 
  Search, 
  ArrowLeft, 
  ArrowRight, 
  UploadCloud, 
  X, 
  RefreshCw, 
  Play, 
  Star, 
  Copy, 
  ExternalLink, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  LayoutGrid, 
  List as ListIcon,
  ChevronRight,
  Database,
  Layers
} from "lucide-react";
import { graphClient, EntityNode } from "@lib/core";
import { SmartImage } from "@/app/components";
import { uploadMediaFiles, listMediaAssets, deleteMediaAsset, UploadedAsset } from "@/lib/media";
import { PageLayout, PageContent, TopbarActions } from "../../components";
import { theme } from "../../theme";
import { toJson } from "@bufbuild/protobuf";
import { ListValueSchema } from "@bufbuild/protobuf/wkt";

export interface ModelMediaAsset {
  id: string;
  name: string;
  url: string;
  mediaType: "image" | "video" | "audio" | "document";
  mimeType?: string;
  fileSize?: number;
  sourceType: "model" | "variant" | "upload";
  entityName?: string;
  entitySlug?: string;
  isCover?: boolean;
}

export interface ModelDirectory {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  brandSlug: string;
  category: "4w" | "2w";
  coverUrl?: string;
  variantsCount: number;
  assets: ModelMediaAsset[];
  updatedAt?: string;
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
        id: `media-${idx}`,
        url: unwrapped,
        name: `Media ${idx + 1}`,
        type: "gallery",
        isCover: idx === 0,
      });
    } else if (unwrapped && typeof unwrapped === "object" && unwrapped.url) {
      results.push({
        id: String(unwrapped.id || `media-${idx}`),
        url: String(unwrapped.url),
        name: String(unwrapped.name || unwrapped.originalName || "Media File"),
        type: String(unwrapped.type || "gallery"),
        isCover: Boolean(unwrapped.isCover || unwrapped.type === "featured" || idx === 0),
        mimeType: unwrapped.mimeType || unwrapped.mime_type,
      });
    }
  }
  return results;
}

function detectMediaType(url: string = "", mime: string = "", name: string = ""): "image" | "video" | "audio" | "document" {
  const check = (url + " " + name).toLowerCase();
  if (mime) {
    if (mime.startsWith("video/")) return "video";
    if (mime.startsWith("audio/")) return "audio";
    if (mime.startsWith("image/")) return "image";
  }
  if (check.match(/\.(mp4|mov|webm|mkv|avi|m4v)(\?.*)?$/)) return "video";
  if (check.match(/\.(mp3|wav|ogg|flac|aac)(\?.*)?$/)) return "audio";
  return "image";
}

function ModelMediaDirectoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeModelSlug = searchParams ? searchParams.get("model") || null : null;

  const [directories, setDirectories] = useState<ModelDirectory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "4w" | "2w">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [itemViewMode, setItemViewMode] = useState<"grid" | "list">("list");
  const [selectedAsset, setSelectedAsset] = useState<ModelMediaAsset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<ModelMediaAsset | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load all model directories with their media
  const loadModelDirectories = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all Model nodes from Knowledge Graph
      const modelsRes = await graphClient.searchNodes({
        query: "",
        types: ["model", "Model"],
        limit: 300,
        vector: [],
      });

      // 2. Fetch all Variant nodes to harvest child media
      const variantsRes = await graphClient.searchNodes({
        query: "",
        types: ["variant", "Variant"],
        limit: 800,
        vector: [],
      });

      // 3. Fetch uploaded media assets from Cloudflare R2
      let uploadedAssets: UploadedAsset[] = [];
      try {
        const mediaRes = await listMediaAssets({ limit: 300 });
        uploadedAssets = mediaRes.assets || [];
      } catch (err) {
        console.warn("R2 assets listing skipped:", err);
      }

      const rawModels = modelsRes.nodes || [];
      const rawVariants = variantsRes.nodes || [];

      // Group variants by model slug / model id
      const variantsByModel = new Map<string, any[]>();
      rawVariants.forEach((v) => {
        const modelId = v.metadata?.model_id as string;
        const vSlug = v.slug.toLowerCase();
        
        let matchedModelSlug = "";
        for (const m of rawModels) {
          if ((modelId && m.id === modelId) || vSlug.startsWith(m.slug.toLowerCase())) {
            matchedModelSlug = m.slug;
            break;
          }
        }

        if (matchedModelSlug) {
          const list = variantsByModel.get(matchedModelSlug) || [];
          list.push(v);
          variantsByModel.set(matchedModelSlug, list);
        }
      });

      // Build model directory entries
      const directoryList: ModelDirectory[] = rawModels.map((m) => {
        const mSlug = m.slug;
        const rawName = (m.name as any)?.en || (m.name as any)?.default || mSlug;
        const brandSlug = String(m.metadata?.brand_slug || mSlug.split("-")[0] || "");
        const brandName = brandSlug.replace(/-/g, " ").toUpperCase();
        const category = String(m.metadata?.category || "4w").toLowerCase() as "4w" | "2w";

        const assetMap = new Map<string, ModelMediaAsset>();

        // Harvest media on model node
        const directModelMedia = parseNodeMedia(m.media);
        directModelMedia.forEach((mediaItem, idx) => {
          const mType = detectMediaType(mediaItem.url, mediaItem.mimeType, mediaItem.name);
          assetMap.set(mediaItem.url, {
            id: mediaItem.id || `model-${mSlug}-${idx}`,
            name: mediaItem.name || `${rawName} Media`,
            url: mediaItem.url,
            mediaType: mType,
            mimeType: mediaItem.mimeType,
            sourceType: "model",
            entityName: `${rawName} (Model Level)`,
            entitySlug: mSlug,
            isCover: Boolean(mediaItem.isCover),
          });
        });

        // Harvest media on linked variants
        const childVariants = variantsByModel.get(mSlug) || [];
        childVariants.forEach((v) => {
          const vName = (v.name as any)?.en || (v.name as any)?.default || v.slug;
          const vMedia = parseNodeMedia(v.media);
          vMedia.forEach((mediaItem, idx) => {
            if (!assetMap.has(mediaItem.url)) {
              const mType = detectMediaType(mediaItem.url, mediaItem.mimeType, mediaItem.name);
              assetMap.set(mediaItem.url, {
                id: mediaItem.id || `variant-${v.slug}-${idx}`,
                name: mediaItem.name || `${vName} Photo`,
                url: mediaItem.url,
                mediaType: mType,
                mimeType: mediaItem.mimeType,
                sourceType: "variant",
                entityName: vName,
                entitySlug: v.slug,
                isCover: Boolean(mediaItem.isCover),
              });
            }
          });
        });

        // Match uploaded R2 assets whose name/key contains model slug keywords or specific model token
        const slugKeywords = mSlug.toLowerCase().split("-").filter(k => k.length > 2);
        const modelSpecificWord = mSlug.toLowerCase().replace(/^(hyundai|maruti-suzuki|maruti|tata|mahindra|toyota|kia|honda|bmw|audi|mercedes|volkswagen|skoda|byd|mg|citroen|nissan|renault)-/, '');
        
        uploadedAssets.forEach((up) => {
          const targetStr = ((up.original_name || up.originalName || "") + " " + up.url).toLowerCase();
          const matches = 
            targetStr.includes(mSlug.toLowerCase()) ||
            (modelSpecificWord.length > 2 && targetStr.includes(modelSpecificWord)) ||
            (slugKeywords.length > 0 && slugKeywords.every(kw => targetStr.includes(kw)));

          if (matches && !assetMap.has(up.url)) {
            const mType = detectMediaType(up.url, up.mime_type || up.mimeType, up.original_name || up.originalName);
            assetMap.set(up.url, {
              id: up.id,
              name: up.original_name || up.originalName || "Uploaded Media",
              url: up.url,
              mediaType: mType,
              mimeType: up.mime_type || up.mimeType,
              fileSize: up.file_size,
              sourceType: "upload",
              entityName: `${rawName} Uploads`,
              entitySlug: mSlug,
            });
          }
        });

        const assetsArray = Array.from(assetMap.values());
        const cover = assetsArray.find(a => a.isCover)?.url || assetsArray[0]?.url;

        return {
          id: m.id,
          slug: mSlug,
          name: rawName,
          brandName: brandName || "Brand",
          brandSlug,
          category,
          coverUrl: cover,
          variantsCount: childVariants.length,
          assets: assetsArray,
          updatedAt: m.updatedAt,
        };
      });

      // Filter: only models that have at least 1 image/asset (rest are ignored)
      const populatedDirectories = directoryList.filter((d) => d.assets.length > 0);

      // Sort models: those with most assets first, then alphabetically
      populatedDirectories.sort((a, b) => {
        if (b.assets.length !== a.assets.length) return b.assets.length - a.assets.length;
        return a.name.localeCompare(b.name);
      });

      setDirectories(populatedDirectories);
    } catch (err) {
      console.error("Failed to load model directories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadModelDirectories();
  }, []);

  // Currently active model directory (if one is clicked)
  const activeDirectory = useMemo(() => {
    if (!activeModelSlug) return null;
    return directories.find(d => d.slug === activeModelSlug) || null;
  }, [directories, activeModelSlug]);

  // Filtered directories for root view
  const filteredDirectories = useMemo(() => {
    return directories.filter((dir) => {
      if (dir.assets.length === 0) return false;
      if (categoryFilter !== "all" && dir.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = dir.name.toLowerCase().includes(q);
        const matchesSlug = dir.slug.toLowerCase().includes(q);
        const matchesBrand = dir.brandName.toLowerCase().includes(q);
        if (!matchesName && !matchesSlug && !matchesBrand) return false;
      }
      return true;
    });
  }, [directories, categoryFilter, searchQuery]);

  // Filtered assets inside the currently open directory
  const filteredAssets = useMemo(() => {
    if (!activeDirectory) return [];
    if (!searchQuery.trim()) return activeDirectory.assets;
    const q = searchQuery.toLowerCase().trim();
    return activeDirectory.assets.filter(a => 
      a.name.toLowerCase().includes(q) ||
      (a.entityName && a.entityName.toLowerCase().includes(q)) ||
      a.id.toLowerCase().includes(q)
    );
  }, [activeDirectory, searchQuery]);

  // Copy URL
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast("Media link copied to clipboard");
  };

  // Delete asset handler
  const handleDeleteAsset = async (asset: ModelMediaAsset) => {
    try {
      if (asset.sourceType === "upload") {
        await deleteMediaAsset(asset.id);
      }
      // Update local state
      setDirectories((prev) => 
        prev.map((dir) => ({
          ...dir,
          assets: dir.assets.filter((a) => a.id !== asset.id),
        }))
      );
      setAssetToDelete(null);
      if (selectedAsset?.id === asset.id) setSelectedAsset(null);
      showToast("Media asset deleted");
    } catch (err) {
      console.error("Failed to delete asset:", err);
      alert("Failed to delete asset.");
    }
  };

  // Upload handler for current model folder
  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0 || !activeDirectory) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadMediaFiles(fileArray, "gallery");
      const newItems: ModelMediaAsset[] = (uploaded || []).map((u: any, idx: number) => ({
        id: u.id || `up-${Date.now()}-${idx}`,
        name: u.original_name || u.originalName || fileArray[idx]?.name || "New Media",
        url: u.url,
        mediaType: detectMediaType(u.url, u.mime_type || u.mimeType, u.original_name || u.originalName),
        sourceType: "upload",
        entityName: `${activeDirectory.name} Uploads`,
        entitySlug: activeDirectory.slug,
      }));

      // Update directory state
      setDirectories((prev) =>
        prev.map((dir) => {
          if (dir.slug === activeDirectory.slug) {
            return {
              ...dir,
              assets: [...newItems, ...dir.assets],
              coverUrl: dir.coverUrl || newItems[0]?.url,
            };
          }
          return dir;
        })
      );

      setShowUploader(false);
      showToast(`Uploaded ${newItems.length} media file(s) to ${activeDirectory.name}`);
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert("Failed to upload media files: " + (err.message || "Unknown error"));
    } finally {
      setIsUploading(false);
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
                placeholder={activeDirectory ? `Filter in ${activeDirectory.name}...` : "Filter model folders..."}
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
              onClick={() => {
                if (activeDirectory) setItemViewMode("grid");
                else setViewMode("grid");
              }}
              className={`p-1.5 rounded-lg transition-all ${
                (activeDirectory ? itemViewMode === "grid" : viewMode === "grid")
                  ? "bg-white text-slate-900"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeDirectory) setItemViewMode("list");
                else setViewMode("list");
              }}
              className={`p-1.5 rounded-lg transition-all ${
                (activeDirectory ? itemViewMode === "list" : viewMode === "list")
                  ? "bg-white text-slate-900"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadModelDirectories}
            disabled={isLoading}
            className={theme.buttons.icon}
            title="Reload Directories"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-slate-400" : ""}`} />
          </button>

          {/* Upload Button (if in a specific model directory) */}
          {activeDirectory && (
            <button
              type="button"
              onClick={() => setShowUploader((prev) => !prev)}
              className={theme.buttons.primary}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{showUploader ? "Close" : "Upload to Model"}</span>
            </button>
          )}
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

        {/* ============================================================== */}
        {/* CASE 1: INSIDE A SPECIFIC MODEL DIRECTORY FOLDER */}
        {/* ============================================================== */}
        {activeDirectory ? (
          <div className="space-y-6">
            {/* Back Navigation & Directory Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    router.push("/console/media/model");
                    setSearchQuery("");
                  }}
                  className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>All Models</span>
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                      {activeDirectory.brandName}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {activeDirectory.slug}
                    </span>
                  </div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                    <span>{activeDirectory.name}</span>
                  </h1>
                </div>
              </div>

              {/* Directory Metadata Stats */}
              <div className="flex items-center gap-3">
                <div className="px-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Total Assets</span>
                  <span className="text-sm font-black text-slate-900">{activeDirectory.assets.length}</span>
                </div>
                <div className="px-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Variants</span>
                  <span className="text-sm font-black text-slate-900">{activeDirectory.variantsCount}</span>
                </div>
                <div className="px-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-center uppercase font-bold text-xs text-slate-700">
                  {activeDirectory.category}
                </div>
              </div>
            </div>

            {/* Collapsible Uploader for This Model */}
            <AnimatePresence>
              {showUploader && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                          <UploadCloud className="w-4 h-4 text-blue-600" />
                          <span>Direct Ingest to {activeDirectory.name}</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Drop high-resolution images or video walkarounds to store in Cloudflare R2 and associate with this model.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowUploader(false)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) handleFileUpload(e.target.files);
                        }}
                      />
                      {isUploading ? (
                        <div className="flex flex-col items-center space-y-3">
                          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                          <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                            Ingesting media assets...
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                            <UploadCloud className="w-6 h-6 text-blue-600" />
                          </div>
                          <p className="text-xs font-bold text-slate-900">
                            Click or drag files here to upload to <span className="text-blue-600">{activeDirectory.name}</span>
                          </p>
                          <p className="text-[11px] text-slate-400">
                            JPG, PNG, WebP, AVIF, MP4 up to 20MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Showcase Media Items inside Model Directory */}
            {filteredAssets.length === 0 ? (
              <div className="p-16 rounded-3xl border border-dashed border-slate-300 bg-white text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">No media in this model directory</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    No images or videos have been linked to {activeDirectory.name} yet. Click "Upload to Model" to add some.
                  </p>
                </div>
              </div>
            ) : itemViewMode === "grid" ? (
              /* Grid View of Model Media */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="group relative bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-3xl overflow-hidden transition-all flex flex-col cursor-pointer"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    {/* Thumbnail Viewport */}
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

                    {/* Card Footer */}
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
                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 text-[9px] font-mono font-bold uppercase tracking-wider truncate max-w-[140px]">
                          {asset.entityName || activeDirectory.name}
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
              /* List View of Model Media (Exact Requested Feel) */
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
                        <span className="text-slate-900 font-bold group-hover:text-blue-600 transition-colors">
                          {asset.name}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2 truncate">
                        <span>{asset.entityName || activeDirectory.name}</span>
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
            )}
          </div>
        ) : (
          /* ============================================================== */
          /* CASE 2: ROOT VIEW - DIRECTORY OF ALL VEHICLE MODELS */
          /* ============================================================== */
          <div className="space-y-6">
            {/* Header Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2.5">
                  <div className="w-6 h-[2px] bg-blue-600" />
                  Vehicle Model Folders ({filteredDirectories.length})
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  1 Dir per Model • Models with Images
                </span>
              </div>

              {/* Category Segmented Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCategoryFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    categoryFilter === "all" ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  All ({directories.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("4w")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    categoryFilter === "4w" ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  4 Wheel
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("2w")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    categoryFilter === "2w" ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  2 Wheel
                </button>
              </div>
            </div>

            {/* Model Directories Grid or List */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-48 bg-slate-50 border border-slate-200 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : filteredDirectories.length === 0 ? (
              <div className="p-16 rounded-3xl border border-dashed border-slate-300 bg-white text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                  <Folder className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">No model folders match your filter</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try searching for another model name or switch category filters.
                  </p>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              /* Grid of Model Folders (Matching Console Card Look) */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredDirectories.map((dir) => (
                  <div
                    key={dir.slug}
                    onClick={() => {
                      router.push(`/console/media/model?model=${dir.slug}`);
                    }}
                    className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer group flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    {/* Top Folder Header */}
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-500">
                        {dir.coverUrl ? (
                          <div className="w-full h-full rounded-2xl overflow-hidden relative">
                            <SmartImage
                              src={dir.coverUrl}
                              alt={dir.name}
                              variant="thumbnail"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <Folder className="w-5 h-5 group-hover:text-white transition-colors" />
                        )}
                      </div>

                      <div className="px-3 py-1.5 bg-white text-slate-600 rounded-xl text-[10px] font-mono font-bold border border-slate-200 flex items-center gap-1.5">
                        <ImageIcon className="w-3 h-3 text-slate-400" />
                        <span>{dir.assets.length} Assets</span>
                      </div>
                    </div>

                    {/* Folder Content Info */}
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
                        {dir.brandName}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-0.5 truncate" title={dir.name}>
                        {dir.name}
                      </h3>
                      <p className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                        dir/{dir.slug}
                      </p>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                      <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 font-mono font-bold uppercase">
                        {dir.variantsCount} Variants
                      </span>
                      <span className="text-slate-400 group-hover:text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">
                        <span>Open Dir</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List of Model Folders (Exact Console Activity Feed Look) */
              <div className="space-y-4">
                {filteredDirectories.map((dir) => (
                  <div
                    key={dir.slug}
                    onClick={() => {
                      router.push(`/console/media/model?model=${dir.slug}`);
                    }}
                    className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex items-center gap-6 hover:bg-slate-100 transition-all cursor-pointer group"
                  >
                    {/* Folder Preview Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center border border-slate-200 overflow-hidden shrink-0 relative group-hover:border-blue-400 transition-colors">
                      {dir.coverUrl ? (
                        <SmartImage
                          src={dir.coverUrl}
                          alt={dir.name}
                          variant="thumbnail"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Folder className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      )}
                    </div>

                    {/* Middle Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-600 font-semibold truncate">
                        Model Directory <span className="text-slate-900 font-bold group-hover:text-blue-600 transition-colors">{dir.name}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2 truncate">
                        <span>{dir.brandName}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">dir/{dir.slug}</span>
                        <span>•</span>
                        <span>{dir.variantsCount} Linked Variants</span>
                      </p>
                    </div>

                    {/* Right Badges & Enter Dir Arrow */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="px-3 py-1.5 bg-white text-slate-600 rounded-lg text-[10px] font-mono border border-slate-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3 h-3 text-slate-400" />
                        <span>{dir.assets.length} Assets</span>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* LIGHTBOX MODAL */}
        {/* ============================================================== */}
        <AnimatePresence>
          {selectedAsset && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
              onClick={() => setSelectedAsset(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="min-w-0 pr-4">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {selectedAsset.name}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                      {selectedAsset.id}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAsset(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Viewport */}
                <div className={`relative flex-1 min-h-[350px] max-h-[500px] flex items-center justify-center p-4 ${
                  isPngAsset(selectedAsset) ? "bg-transparency-grid" : "bg-slate-950"
                }`}>
                  {selectedAsset.mediaType === "video" ? (
                    <video
                      src={selectedAsset.url}
                      controls
                      autoPlay
                      className="max-h-full max-w-full rounded-xl"
                    />
                  ) : (
                    <div className="relative w-full h-full min-h-[320px]">
                      <SmartImage
                        src={selectedAsset.url}
                        alt={selectedAsset.name}
                        variant="full"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Modal Footer Controls */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 text-[10px] font-mono uppercase font-bold">
                      {selectedAsset.mediaType}
                    </span>
                    <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 text-[10px] font-mono uppercase font-bold">
                      {selectedAsset.sourceType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedAsset.url)}
                      className={theme.buttons.secondary}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </button>
                    <a
                      href={selectedAsset.url}
                      target="_blank"
                      rel="noreferrer"
                      className={theme.buttons.secondary}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Original</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteAsset(selectedAsset);
                      }}
                      className={theme.buttons.danger}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
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
              className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setAssetToDelete(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Delete media asset?</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Are you sure you want to remove <strong className="text-slate-800">{assetToDelete.name}</strong> from this model repository?
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAssetToDelete(null)}
                    className={theme.buttons.secondary}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAsset(assetToDelete)}
                    className={theme.buttons.danger}
                  >
                    Confirm Delete
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

export default function ModelMediaDirectoryPage() {
  return (
    <React.Suspense fallback={
      <PageLayout className={theme.layout.pageContainer}>
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
        </div>
      </PageLayout>
    }>
      <ModelMediaDirectoryContent />
    </React.Suspense>
  );
}
