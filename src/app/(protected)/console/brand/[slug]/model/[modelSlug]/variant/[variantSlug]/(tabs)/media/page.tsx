"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Image as ImageIcon,
  Loader2,
  Star,
  UploadCloud,
  CheckCircle2,
  Layers,
  Search,
  X,
  RefreshCw,
  Car,
  Plus,
  Database,
  Check,
  Video,
  Film,
  Filter,
  CheckSquare,
  Square,
  ExternalLink
} from "lucide-react";
import { graphClient, EntityNode } from "@lib/core";
import { MediaUploader, MediaPreview, MediaItem, SmartImage } from "@/app/components";
import { uploadMediaFiles, listMediaAssets } from "@/lib/media";
import { CONFIG } from "@/lib/config";
import { fromJson, toJson } from "@bufbuild/protobuf";
import { ListValueSchema } from "@bufbuild/protobuf/wkt";
import { motion, AnimatePresence } from "framer-motion";
import { PageLayout, PageContent, TopbarActions } from "@app/(protected)/console/components";
import { theme } from "@app/(protected)/console/theme";

export interface ExistingLibraryItem {
  id: string;
  name: string;
  url: string;
  mediaType: string;
  source: string;
  isCover?: boolean;
}

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

export default function VariantMediaPage() {
  const params = useParams();
  const variantSlug = params.variantSlug as string;
  const modelSlug = params.modelSlug as string;
  const brandSlug = params.slug as string;

  const [variant, setVariant] = useState<EntityNode | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  // Upload state
  const [uploadType, setUploadType] = useState<"gallery" | "featured">("gallery");
  const [filterType, setFilterType] = useState<"all" | "featured" | "gallery">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Existing Media Library Picker Modal State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [libraryItems, setLibraryItems] = useState<ExistingLibraryItem[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryTypeFilter, setLibraryTypeFilter] = useState<"all" | "image" | "video" | "model" | "brand">("all");
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<string[]>([]);
  const [attachRole, setAttachRole] = useState<"gallery" | "featured">("gallery");

  const loadData = async () => {
    if (!variantSlug) return;
    setIsLoading(true);
    try {
      const res = await graphClient.getNode({ id: "", slug: variantSlug });
      if (res.node && res.node.id) {
        const v: EntityNode = {
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
        setVariant(v);
        const parsed = parseNodeMedia(res.node.media);
        setMediaItems(parsed);
        setIsNotFound(false);
      } else {
        setIsNotFound(true);
      }
    } catch (err) {
      console.error("Failed to load variant media:", err);
      setIsNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [variantSlug]);

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const persistMediaToGraph = async (updatedMedia: MediaItem[]) => {
    if (!variant) return;
    setIsUpdating(true);
    try {
      const protoList = fromJson(ListValueSchema, updatedMedia as any);
      await graphClient.updateNode({
        id: variant.id,
        name: variant.name,
        description: variant.description,
        tags: variant.tags,
        metadata: variant.metadata,
        data: variant.data,
        media: protoList as any,
        embedding: []
      });
      setMediaItems(updatedMedia);
    } catch (err) {
      console.error("Failed to update media in graph:", err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Option 1: Handle uploading new media files
  const handleUploadMedia = async (uploadedFiles: File[]) => {
    if (!variant || uploadedFiles.length === 0) return;
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
      setShowUploader(false);
      showNotification(`${uploadedFiles.length} new file(s) uploaded successfully!`);
    } catch (err) {
      console.error("Failed to upload media:", err);
      alert("Failed to upload media. Please check service connectivity.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Option 2: Load existing media items from central media service, model node, and brand node
  const openExistingMediaPicker = async () => {
    setIsPickerOpen(true);
    setIsLoadingLibrary(true);
    setSelectedLibraryIds([]);
    const itemsMap = new Map<string, ExistingLibraryItem>();

    // 1. Fetch from Media Service
    try {
      const res = await listMediaAssets({ limit: 100 });
      if (res && Array.isArray(res.assets)) {
        res.assets.forEach((a) => {
          itemsMap.set(a.id, {
            id: a.id,
            name: a.original_name || a.originalName || "Uploaded Asset",
            url: a.url,
            mediaType: (a.media_type || a.mediaType || "image").toLowerCase(),
            source: "Media Repository",
          });
        });
      }
    } catch (err) {
      console.warn("Media service assets list skipped:", err);
    }

    // 2. Fetch from parent Model node
    if (modelSlug) {
      try {
        const mRes = await graphClient.getNode({ id: "", slug: modelSlug });
        if (mRes.node && mRes.node.media) {
          const parsed = parseNodeMedia(mRes.node.media);
          parsed.forEach((m, idx) => {
            const key = m.id && !m.id.startsWith("media-") ? m.id : `model-${idx}-${m.url}`;
            if (!itemsMap.has(key)) {
              itemsMap.set(key, {
                id: key,
                name: m.name || `${modelSlug.replace(/-/g, " ")} Media`,
                url: m.url,
                mediaType: (m.type || "image").toLowerCase(),
                source: `Model (${modelSlug.replace(/-/g, " ")})`,
              });
            }
          });
        }
      } catch (err) {
        console.warn("Parent model media fetch skipped:", err);
      }
    }

    // 3. Fetch from Brand node
    if (brandSlug) {
      try {
        const bRes = await graphClient.getNode({ id: "", slug: brandSlug });
        if (bRes.node && bRes.node.media) {
          const parsed = parseNodeMedia(bRes.node.media);
          parsed.forEach((b, idx) => {
            const key = b.id && !b.id.startsWith("media-") ? b.id : `brand-${idx}-${b.url}`;
            if (!itemsMap.has(key)) {
              itemsMap.set(key, {
                id: key,
                name: b.name || `${brandSlug.replace(/-/g, " ")} Asset`,
                url: b.url,
                mediaType: (b.type || "image").toLowerCase(),
                source: `Brand (${brandSlug.replace(/-/g, " ")})`,
              });
            }
          });
        }
      } catch (err) {
        console.warn("Brand media fetch skipped:", err);
      }
    }

    setLibraryItems(Array.from(itemsMap.values()));
    setIsLoadingLibrary(false);
  };

  // Toggle selection in library picker
  const toggleSelectLibraryItem = (id: string) => {
    setSelectedLibraryIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Attach selected library assets to the current variant
  const handleAttachSelectedExisting = async () => {
    if (selectedLibraryIds.length === 0) return;
    setIsUpdating(true);

    try {
      const chosenItems = libraryItems.filter(item => selectedLibraryIds.includes(item.id));

      let current = [...mediaItems];
      if (attachRole === "featured") {
        current = current.map(item => ({ ...item, isCover: false }));
      }

      const newlyAdded: MediaItem[] = chosenItems.map((item, idx) => ({
        id: item.id.startsWith("model-") || item.id.startsWith("brand-") ? `${Date.now()}-${idx}` : item.id,
        url: item.url,
        name: item.name,
        type: attachRole,
        isCover: attachRole === "featured" && idx === 0,
      }));

      const merged = [...current, ...newlyAdded];
      await persistMediaToGraph(merged);
      setIsPickerOpen(false);
      showNotification(`${newlyAdded.length} asset(s) attached from existing media!`);
    } catch (err) {
      console.error("Failed to attach selected media:", err);
      alert("Failed to attach selected media to variant.");
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

  const filteredItems = useMemo(() => {
    return mediaItems.filter(item => {
      if (filterType === "featured" && !(item.isCover || item.type === "featured")) return false;
      if (filterType === "gallery" && (item.isCover || item.type === "featured")) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (item.name || "").toLowerCase().includes(q);
        const matchesType = (item.type || "").toLowerCase().includes(q);
        if (!matchesName && !matchesType) return false;
      }
      return true;
    });
  }, [mediaItems, filterType, searchQuery]);

  // Existing library filtered items
  const filteredLibraryItems = useMemo(() => {
    return libraryItems.filter(item => {
      if (libraryTypeFilter === "image" && item.mediaType !== "image") return false;
      if (libraryTypeFilter === "video" && item.mediaType !== "video") return false;
      if (libraryTypeFilter === "model" && !item.source.startsWith("Model")) return false;
      if (libraryTypeFilter === "brand" && !item.source.startsWith("Brand")) return false;

      if (librarySearch.trim()) {
        const q = librarySearch.toLowerCase().trim();
        return item.name.toLowerCase().includes(q) || item.source.toLowerCase().includes(q) || item.url.toLowerCase().includes(q);
      }
      return true;
    });
  }, [libraryItems, libraryTypeFilter, librarySearch]);

  const coverItem = useMemo(() => mediaItems.find(m => m.isCover), [mediaItems]);
  const galleryCount = useMemo(() => mediaItems.filter(i => !i.isCover && i.type !== "featured").length, [mediaItems]);
  const variantDisplayName = (variant?.name as any)?.en || (variant?.name as any)?.default || variantSlug;

  if (isNotFound) {
    return (
      <PageLayout className={theme.layout.pageContainer}>
        <PageContent className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center max-w-lg space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
              <Car className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Variant Not Found</h1>
            <p className="text-slate-500 text-xs leading-relaxed">
              The variant <strong className="text-slate-700">"{variantSlug}"</strong> does not exist in the graph registry.
            </p>
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <PageLayout className={theme.layout.pageContainer}>
      <TopbarActions>
        <div className="flex items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 gap-2 animate-in fade-in zoom-in-95 duration-150">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Filter media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs font-medium text-slate-900 outline-none w-40 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Close search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 rounded-xl border border-slate-200 transition-all flex items-center justify-center shrink-0 cursor-pointer ${searchQuery
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                title="Search Media"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Reload / Refresh Button */}
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading || isUpdating}
            className={theme.buttons.icon}
            title="Refresh Media"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-slate-400" : ""}`} />
          </button>
        </div>
      </TopbarActions>

      <PageContent className={theme.layout.contentWrapper}>
        {/* Floating Notification */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 bg-emerald-600 text-white font-bold text-xs rounded-2xl flex items-center gap-2.5 max-w-md mx-auto"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{feedbackMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Option 1: Collapsible Upload New Media Panel */}
        <AnimatePresence>
          {showUploader && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2.5">
                      <UploadCloud className="w-4 h-4 text-slate-700" />
                      Option 1: Upload New Media Files
                    </h2>
                    <p className="text-xs font-normal text-slate-500 mt-1">
                      Drop new high-resolution images or videos from your computer to ingest and link to this variant.
                    </p>
                  </div>

                  {/* Destination Segmented Toggle */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setUploadType("gallery")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${uploadType === "gallery"
                          ? "bg-white text-slate-900"
                          : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                      Gallery Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadType("featured")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${uploadType === "featured"
                          ? "bg-white text-amber-600"
                          : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      Featured Cover
                    </button>
                  </div>
                </div>

                {isUpdating ? (
                  <div className="h-56 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                    <Loader2 className="w-7 h-7 text-slate-700 animate-spin" />
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Processing & Uploading...
                    </p>
                    <p className="text-[11px] text-slate-400">Saving media assets to Cloudflare R2 and graph</p>
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section Header & Action Buttons */}
        <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2.5">
              <div className="w-6 h-[2px] bg-slate-400" />
              Variant Media Gallery ({filteredItems.length})
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/60 capitalize">
              {variantDisplayName}
            </span>
            {isUpdating && (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <Loader2 className="w-3 h-3 animate-spin text-slate-600" />
                Syncing...
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter Mode Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterType === "all"
                    ? "bg-white text-slate-900"
                    : "text-slate-500 hover:text-slate-900"
                  }`}
              >
                All ({mediaItems.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("featured")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterType === "featured"
                    ? "bg-white text-slate-900"
                    : "text-slate-500 hover:text-slate-900"
                  }`}
              >
                Cover ({mediaItems.filter(i => i.isCover || i.type === "featured").length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("gallery")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterType === "gallery"
                    ? "bg-white text-slate-900"
                    : "text-slate-500 hover:text-slate-900"
                  }`}
              >
                Gallery ({galleryCount})
              </button>
            </div>

            {/* Quick Actions for Option 1 & Option 2 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openExistingMediaPicker}
                className={theme.buttons.secondary}
              >
                <Database className="w-3.5 h-3.5 text-slate-600" />
                <span>Select from Existing</span>
              </button>
              <button
                type="button"
                onClick={() => setShowUploader(prev => !prev)}
                className={theme.buttons.primary}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{showUploader ? "Hide Uploader" : "Upload New Media"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Showcase Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-white border border-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl">
            <MediaPreview
              items={filteredItems}
              onRemove={handleRemoveMedia}
              onSetCover={handleSetCover}
              gridClassName="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            />
          </div>
        ) : (
          /* Empty State Presenting Both Options */
          <div className="p-16 rounded-3xl border border-dashed border-slate-300 bg-white text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
              <ImageIcon className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">No media attached to this variant</h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
                Add photos and video walkarounds by choosing one of the two options below:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-2">
              {/* Option 1 Box */}
              <div
                onClick={() => setShowUploader(true)}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-left transition-all cursor-pointer group space-y-2"
              >
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">1. Upload New Media</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Drop local images or videos directly from your device</p>
                </div>
              </div>

              {/* Option 2 Box */}
              <div
                onClick={openExistingMediaPicker}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-left transition-all cursor-pointer group space-y-2"
              >
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">2. Select from Existing</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Choose from uploaded repository, model, or brand assets</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Option 2: Select from Existing Media Types Modal */}
        <AnimatePresence>
          {isPickerOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
              onClick={() => setIsPickerOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-600" />
                      Select from Existing Media Types
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-normal">
                      Browse previously uploaded assets, parent model shots, and brand images to attach to <strong className="text-slate-800">{variantDisplayName}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 self-end sm:self-auto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Filter and Role Controls */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search existing media..."
                        value={librarySearch}
                        onChange={(e) => setLibrarySearch(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none w-44 sm:w-56 focus:border-slate-900"
                      />
                    </div>

                    {/* Type Filter Buttons */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setLibraryTypeFilter("all")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${libraryTypeFilter === "all" ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-900"
                          }`}
                      >
                        All ({libraryItems.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setLibraryTypeFilter("image")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${libraryTypeFilter === "image" ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-900"
                          }`}
                      >
                        Images
                      </button>
                      <button
                        type="button"
                        onClick={() => setLibraryTypeFilter("video")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${libraryTypeFilter === "video" ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-900"
                          }`}
                      >
                        Videos
                      </button>
                      <button
                        type="button"
                        onClick={() => setLibraryTypeFilter("model")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${libraryTypeFilter === "model" ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-900"
                          }`}
                      >
                        Model Media
                      </button>
                      <button
                        type="button"
                        onClick={() => setLibraryTypeFilter("brand")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${libraryTypeFilter === "brand" ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-900"
                          }`}
                      >
                        Brand
                      </button>
                    </div>
                  </div>

                  {/* Role Selector: Gallery vs Featured Cover */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Attach As:
                    </span>
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setAttachRole("gallery")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${attachRole === "gallery" ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-900"
                          }`}
                      >
                        Gallery Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttachRole("featured")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${attachRole === "featured" ? "bg-white text-amber-600" : "text-slate-500 hover:text-slate-900"
                          }`}
                      >
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        Featured Cover
                      </button>
                    </div>
                  </div>
                </div>

                {/* Existing Media Grid */}
                <div className="p-6 overflow-y-auto flex-1 max-h-[50vh] custom-scrollbar">
                  {isLoadingLibrary ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading Existing Media Assets...</p>
                    </div>
                  ) : filteredLibraryItems.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {filteredLibraryItems.map((item) => {
                        const isAlreadyAttached = mediaItems.some(m => m.url === item.url);
                        const isSelected = selectedLibraryIds.includes(item.id);

                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              if (!isAlreadyAttached) {
                                toggleSelectLibraryItem(item.id);
                              }
                            }}
                            className={`group relative aspect-square rounded-2xl overflow-hidden border transition-all cursor-pointer flex flex-col justify-between ${isAlreadyAttached
                                ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50"
                                : isSelected
                                  ? "border-blue-600 ring-2 ring-blue-500/20"
                                  : "border-slate-200 hover:border-slate-400 bg-white"
                              }`}
                          >
                            {/* Image Thumbnail */}
                            <div className={`w-full h-full relative ${(item.url.toLowerCase().includes(".png") || item.name.toLowerCase().includes(".png")) ? "bg-transparency-grid-sm" : "bg-slate-900"}`}>
                              <SmartImage
                                src={item.url}
                                alt={item.name}
                                variant="thumbnail"
                                fill
                                className={`w-full h-full ${(item.url.toLowerCase().includes(".png") || item.name.toLowerCase().includes(".png")) ? "object-contain p-2" : "object-cover"}`}
                              />

                              {/* Selection Indicator */}
                              {!isAlreadyAttached && (
                                <div className={`absolute top-2.5 left-2.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isSelected
                                    ? "bg-blue-600 text-white"
                                    : "bg-black/40 text-transparent border border-white/60 group-hover:bg-black/60"
                                  }`}>
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              )}

                              {/* Already Attached Badge */}
                              {isAlreadyAttached && (
                                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[9px] font-bold uppercase tracking-wider">
                                  Attached
                                </div>
                              )}

                              {/* Source Badge */}
                              <div className="absolute bottom-2 inset-x-2 px-2 py-1 bg-slate-950/80 backdrop-blur-md rounded-lg text-white">
                                <p className="text-[10px] font-bold truncate">{item.name}</p>
                                <p className="text-[9px] text-slate-400 font-medium truncate">{item.source}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-16 text-center space-y-2">
                      <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">No matching media found</p>
                      <p className="text-[11px] text-slate-400">Try adjusting your search terms or type filters.</p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-slate-900">{selectedLibraryIds.length}</span>
                    <span className="text-slate-500 ml-1">asset(s) selected</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsPickerOpen(false)}
                      className={theme.buttons.secondary}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={selectedLibraryIds.length === 0 || isUpdating}
                      onClick={handleAttachSelectedExisting}
                      className={theme.buttons.primary}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Attaching...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Attach Selected ({selectedLibraryIds.length})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </PageContent>
    </PageLayout>
  );
}
