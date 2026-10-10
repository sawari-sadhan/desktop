"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Save, 
  Building2, 
  Hash, 
  X, 
  Plus, 
  RefreshCw, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  UploadCloud,
  Link as LinkIcon
} from "lucide-react";
import { graphClient, EntityNode } from "@lib/core";
import { PageLayout, PageContent, TopbarActions } from "../../../components";
import { theme } from "../../../theme";
import { MediaUploader, MediaItem } from "@/app/components/media";
import { uploadMediaFiles } from "@/lib/media";
import { CONFIG } from "@/lib/config";
import { fromJson, toJson } from "@bufbuild/protobuf";
import { ListValueSchema } from "@bufbuild/protobuf/wkt";

// Sanitizer to guarantee strict protobuf compatibility (no undefined values)
function cleanProtobufObject(obj: any): any {
  if (obj === null || obj === undefined) return {};
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj
      .filter((v) => v !== undefined && v !== null)
      .map(cleanProtobufObject);
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || typeof value === "function" || value === null) continue;
    if (typeof value === "number") {
      if (!isNaN(value)) clean[key] = value;
    } else if (typeof value === "boolean" || typeof value === "string") {
      clean[key] = value;
    } else if (Array.isArray(value)) {
      clean[key] = value
        .filter((v) => v !== undefined && v !== null)
        .map(cleanProtobufObject);
    } else if (typeof value === "object") {
      const nested = cleanProtobufObject(value);
      if (nested && typeof nested === "object" && Object.keys(nested).length > 0) {
        clean[key] = nested;
      }
    }
  }
  return clean;
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
        type: "logo",
        isCover: idx === 0,
      });
    } else if (unwrapped && typeof unwrapped === "object" && unwrapped.url) {
      results.push({
        id: String(unwrapped.id || `media-${idx}`),
        url: String(unwrapped.url),
        name: String(unwrapped.name || unwrapped.originalName || "Brand Logo"),
        type: String(unwrapped.type || "logo"),
        isCover: Boolean(unwrapped.isCover),
      });
    }
  }
  return results;
}

export default function BrandDetailPage() {
  const router = useRouter();
  const params = useParams();
  const brandSlug = params?.slug as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [brandNode, setBrandNode] = useState<EntityNode | null>(null);

  // Minimal Core Fields (English only)
  const [nameEn, setNameEn] = useState("");
  const [descEn, setDescEn] = useState("");
  const [slug, setSlug] = useState("");

  // Logo & Media
  const [logoUrl, setLogoUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualLogoUrl, setManualLogoUrl] = useState("");

  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");

  // Live Metrics
  const [totalModels, setTotalModels] = useState(0);
  const [count4W, setCount4W] = useState(0);
  const [count2W, setCount2W] = useState(0);

  useEffect(() => {
    let isMounted = true;
    if (!brandSlug) return;

    const fetchBrand = async () => {
      setIsLoading(true);
      setErrorMsg("");
      try {
        const res = await graphClient.getNode({ id: "", slug: brandSlug });
        if (!res.node) throw new Error("Brand node not found in registry");

        const node = res.node;
        if (!isMounted) return;

        setBrandNode({
          id: node.id,
          type: node.type,
          slug: node.slug,
          name: node.name || {},
          description: node.description || {},
          tags: node.tags || [],
          metadata: node.metadata || {},
          data: node.data || {},
          media: node.media?.values || []
        });

        // Identity (English only)
        const nName = (node.name as any) || {};
        setNameEn(nName.en || nName.default || node.slug);
        setSlug(node.slug);

        const nDesc = (node.description as any) || {};
        setDescEn(nDesc.en || nDesc.default || "");

        // Find existing Logo
        const parsedMedia = parseNodeMedia(node.media);
        const existingLogoItem = parsedMedia.find(m => m.type === "logo" || m.isCover) || parsedMedia[0];
        const nData = (node.data as any) || {};
        const nMeta = (node.metadata as any) || {};
        const discoveredLogo = existingLogoItem?.url || nData.logo || nMeta.logo || "";
        setLogoUrl(discoveredLogo);
        setManualLogoUrl(discoveredLogo);

        // Tags
        setTags(node.tags || []);

        // Fetch connected models count
        const neighborsRes = await graphClient.getNeighbors({
          nodeId: node.id,
          linkTypes: ["has_model"]
        }).catch(() => ({ nodes: [] }));

        const modelNodes = (neighborsRes.nodes || []).filter(n => n.type === "model");
        const m4w = modelNodes.filter(m => {
          const vt = ((m.metadata as any)?.vehicleType || "").toString().toLowerCase();
          const mt = (m.tags || []).map((t: string) => t.toLowerCase());
          return !(vt === "2w" || mt.includes("2w") || mt.includes("motorcycle") || mt.includes("scooter"));
        }).length;
        const m2w = modelNodes.length - m4w;

        setTotalModels(modelNodes.length);
        setCount4W(m4w);
        setCount2W(m2w);

      } catch (err: any) {
        if (isMounted) setErrorMsg(err.message || "Failed to load brand details");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchBrand();
    return () => { isMounted = false; };
  }, [brandSlug]);

  const copySlug = () => {
    if (!slug) return;
    navigator.clipboard.writeText(slug);
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  const handleAddTag = () => {
    const clean = newTagInput.trim().toLowerCase();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Upload Logo file via Media service and auto-persist to database
  const handleUploadLogo = async (uploadedFiles: File[]) => {
    if (uploadedFiles.length === 0 || !brandNode) return;
    setIsUploadingLogo(true);
    setErrorMsg("");
    try {
      const res = await uploadMediaFiles([uploadedFiles[0]], "brand_logo");
      const payload = res.data || res;
      const asset = Array.isArray(payload) ? payload[0] : (payload.asset || payload);
      const assetUrl = asset?.url || `${CONFIG.MEDIA.API_URL}/image/original/${asset?.id}`;
      
      setLogoUrl(assetUrl);
      setManualLogoUrl(assetUrl);

      // Auto-persist directly to database
      const mediaList: MediaItem[] = [{
        id: `logo-${brandNode.id}`,
        url: assetUrl,
        name: `${nameEn.trim() || brandSlug} Logo`,
        type: "logo",
        isCover: true
      }];

      let protoMedia: any = undefined;
      try {
        protoMedia = fromJson(ListValueSchema, mediaList as any);
      } catch {
        protoMedia = undefined;
      }

      await graphClient.updateNode({
        id: brandNode.id,
        name: cleanProtobufObject({ en: nameEn.trim() || brandSlug }),
        description: cleanProtobufObject({ ...(descEn.trim() ? { en: descEn.trim() } : {}) }),
        tags: tags.map(t => t.trim().toLowerCase()).filter(Boolean),
        metadata: cleanProtobufObject({ logo: assetUrl, updated_by: "console" }) as any,
        data: cleanProtobufObject({ logo: assetUrl }) as any,
        ...(protoMedia ? { media: protoMedia } : {})
      });

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 2500);
    } catch (err: any) {
      console.error("Failed to upload brand logo:", err);
      setErrorMsg("Failed to upload brand logo. Please verify media service.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    setLogoUrl("");
    setManualLogoUrl("");
    if (!brandNode) return;

    setIsUploadingLogo(true);
    setErrorMsg("");
    try {
      const emptyMedia = fromJson(ListValueSchema, []);
      await graphClient.updateNode({
        id: brandNode.id,
        name: cleanProtobufObject({ en: nameEn.trim() || brandSlug }),
        description: cleanProtobufObject({ ...(descEn.trim() ? { en: descEn.trim() } : {}) }),
        tags: tags.map(t => t.trim().toLowerCase()).filter(Boolean),
        metadata: cleanProtobufObject({ updated_by: "console" }) as any,
        data: cleanProtobufObject({}) as any,
        media: emptyMedia
      });

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 2000);
    } catch (err: any) {
      console.error("Failed to delete brand logo:", err);
      setErrorMsg("Failed to delete brand logo from database.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleApplyManualUrl = () => {
    const clean = manualLogoUrl.trim();
    if (clean) {
      setLogoUrl(clean);
      setShowUrlInput(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!brandNode) return;

    setIsSaving(true);
    setErrorMsg("");

    try {
      // Build Media list for proto if logo exists
      const mediaList: MediaItem[] = [];
      if (logoUrl.trim()) {
        mediaList.push({
          id: `logo-${brandNode.id}`,
          url: logoUrl.trim(),
          name: `${nameEn.trim() || brandSlug} Logo`,
          type: "logo",
          isCover: true
        });
      }

      let protoMedia: any = undefined;
      try {
        protoMedia = fromJson(ListValueSchema, mediaList as any);
      } catch {
        protoMedia = undefined;
      }

      // Minimal payload: name.en only, description.en only, tags, logo in media & data
      const payload = {
        id: brandNode.id,
        name: cleanProtobufObject({
          en: nameEn.trim() || brandSlug
        }),
        description: cleanProtobufObject({
          ...(descEn.trim() ? { en: descEn.trim() } : {})
        }),
        tags: tags.map(t => t.trim().toLowerCase()).filter(Boolean),
        metadata: cleanProtobufObject({
          ...(logoUrl.trim() ? { logo: logoUrl.trim() } : {}),
          updated_by: "console"
        }) as any,
        data: cleanProtobufObject({
          ...(logoUrl.trim() ? { logo: logoUrl.trim() } : {})
        }) as any,
        ...(protoMedia ? { media: protoMedia } : {})
      };

      await graphClient.updateNode(payload);

      setShowSuccessToast(true);
      setTimeout(() => {
        router.push(`/console/brand/${brandSlug}`);
      }, 1000);
    } catch (err: any) {
      console.error("Save brand error:", err);
      setErrorMsg(err.message || "Failed to update brand. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageLayout className={theme.layout.pageContainer}>
      <TopbarActions>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isUploadingLogo}
            className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? "Saving..." : "Save Brand Profile"}</span>
          </button>
        </div>
      </TopbarActions>

      <PageContent className={theme.layout.contentWrapper}>
        <form onSubmit={handleSave} className="w-full space-y-8 pb-24">

          {/* Success Notification Toast */}
          <AnimatePresence>
            {showSuccessToast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs font-medium border border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Brand details updated successfully! Redirecting...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Entity Profile Header Card */}
          <div className="bg-white p-7 md:p-8 rounded-[2rem] border border-slate-200 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              <div className="flex items-start md:items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl uppercase shrink-0 overflow-hidden p-2">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt={nameEn || "Brand Logo"} 
                      className="w-full h-full object-contain" 
                    />
                  ) : (
                    <span>{nameEn.charAt(0) || "B"}</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                      {nameEn || "Brand Profile"}
                    </h1>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-full border border-slate-200 tracking-wider">
                      node: brand
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copySlug}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-mono text-xs transition-colors cursor-pointer"
                      title="Click to copy slug"
                    >
                      <span>brand/{slug || brandSlug}</span>
                      {copiedSlug ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Metric Badges */}
              <div className="flex items-center gap-3 border-t lg:border-t-0 pt-4 lg:pt-0">
                <div className="px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-lg font-black text-slate-900">{totalModels}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Models</div>
                </div>
                <div className="px-5 py-3 rounded-2xl bg-blue-50/50 border border-blue-100/60 text-center">
                  <div className="text-lg font-black text-blue-600">{count4W}</div>
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">4-Wheelers</div>
                </div>
                <div className="px-5 py-3 rounded-2xl bg-indigo-50/50 border border-indigo-100/60 text-center">
                  <div className="text-lg font-black text-indigo-600">{count2W}</div>
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">2-Wheelers</div>
                </div>
              </div>

            </div>
          </div>

          {/* 12-Column Responsive Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left 8 Cols: Name & Description (en only) */}
            <div className="lg:col-span-8 space-y-8">

              <div className="bg-white p-7 md:p-8 rounded-[2rem] border border-slate-200 space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <Building2 className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Brand Details (English)
                  </h3>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Brand Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="e.g. Hyundai, Toyota, Royal Enfield"
                      required
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-slate-400 focus:outline-hidden transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Description (English)
                    </label>
                    <textarea
                      rows={6}
                      value={descEn}
                      onChange={(e) => setDescEn(e.target.value)}
                      placeholder="Summary overview of the brand..."
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-slate-400 focus:outline-hidden transition-all resize-y"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Right 4 Cols: Brand Logo & Tags */}
            <div className="lg:col-span-4 space-y-8">

              {/* Brand Logo Card (Option to upload & edit brand logo) */}
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-600" />
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                      Brand Logo
                    </h4>
                  </div>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      disabled={isUploadingLogo || isSaving}
                      className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                      title="Remove Logo"
                    >
                      {isUploadingLogo ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span>{isUploadingLogo ? "Removing..." : "Remove"}</span>
                    </button>
                  )}
                </div>

                {/* Current Logo Display or Upload Area */}
                {logoUrl ? (
                  <div className="space-y-4">
                    <div className="relative group w-full h-40 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-center p-4 overflow-hidden">
                      <img 
                        src={logoUrl} 
                        alt="Brand Logo" 
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>Edit URL</span>
                      </button>

                      <a
                        href={logoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <span>Open file</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isUploadingLogo ? (
                      <div className="w-full h-36 rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
                        <span className="text-xs font-bold text-slate-500">Uploading logo...</span>
                      </div>
                    ) : (
                      <MediaUploader
                        maxFiles={1}
                        maxSizeMB={5}
                        acceptedTypes={["image/png", "image/jpeg", "image/webp", "image/avif", "image/svg+xml"]}
                        onUpload={handleUploadLogo}
                      />
                    )}

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>{showUrlInput ? "Hide manual URL" : "Or enter image URL"}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Collapsible Manual URL input */}
                {showUrlInput && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="text-[11px] font-bold text-slate-600">Logo Image URL</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={manualLogoUrl}
                        onChange={(e) => setManualLogoUrl(e.target.value)}
                        placeholder="https://.../logo.png"
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={handleApplyManualUrl}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                      >
                        Set
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Tag className="w-4 h-4 text-slate-600" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                    Tags
                  </h4>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[38px]">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic">No tags added</span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </form>
      </PageContent>
    </PageLayout>
  );
}
