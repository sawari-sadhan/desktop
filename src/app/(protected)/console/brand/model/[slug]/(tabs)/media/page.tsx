"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { graphClient, EntityNode } from "@lib/core";
import { useModelContext } from "../specification/components/ModelContext";
import { MediaUploader, MediaPreview, MediaItem } from "@/app/components";
import { uploadMediaFiles } from "@/lib/media";
import { CONFIG } from "@/lib/config";
import { fromJson } from "@bufbuild/protobuf";
import { ListValueSchema } from "@bufbuild/protobuf/wkt";

export default function MediaPage() {
  const { model, setModel, isUpdating, setIsUpdating } = useModelContext();
  const [uploadType, setUploadType] = useState<"gallery" | "featured">("gallery");

  if (!model) return null;

  const handleUploadMedia = async (uploadedFiles: File[]) => {
    setIsUpdating(true);
    try {
      const response = await uploadMediaFiles(uploadedFiles, uploadType);
      
      const payload = response.data || response;
      const newAssets = Array.isArray(payload) ? payload : (payload.assets || [payload.asset || payload]);

      const newMediaItems: MediaItem[] = newAssets.map((asset: any) => ({
        id: asset.id || Math.random().toString(),
        url: asset.url || `${CONFIG.MEDIA.API_URL}/${uploadType}/${asset.id}`,
        type: uploadType,
        isCover: uploadType === "featured",
        name: asset.originalName || asset.name || "Uploaded Media",
      }));

      const currentMedia = model.media || [];
      const updatedMedia = [...currentMedia, ...newMediaItems];
      
      await graphClient.updateNode({
        id: model.id,
        name: model.name,
        description: model.description,
        tags: model.tags,
        metadata: model.metadata,
        data: model.data,
        media: { values: fromJson(ListValueSchema, updatedMedia).values } as any,
        embedding: []
      });

      setModel({ ...model, media: updatedMedia });
    } catch (err) {
      console.error("Failed to upload media:", err);
      alert("Failed to upload media. Check console.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveMedia = async (mediaId: string) => {
    setIsUpdating(true);
    try {
      const currentMedia = model.media || [];
      const updatedMedia = currentMedia.filter((m: any) => m.id !== mediaId);

      await graphClient.updateNode({
        id: model.id,
        name: model.name,
        description: model.description,
        tags: model.tags,
        metadata: model.metadata,
        data: model.data,
        media: { values: fromJson(ListValueSchema, updatedMedia).values } as any,
        embedding: []
      });

      setModel({ ...model, media: updatedMedia });
    } catch (err) {
      console.error("Failed to remove media:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSetCover = async (mediaId: string) => {
    setIsUpdating(true);
    try {
      const currentMedia = model.media || [];
      const updatedMedia = currentMedia.map((m: any) => ({
        ...m,
        isCover: m.id === mediaId,
        type: m.id === mediaId ? "featured" : (m.type === "featured" ? "gallery" : m.type)
      }));

      await graphClient.updateNode({
        id: model.id,
        name: model.name,
        description: model.description,
        tags: model.tags,
        metadata: model.metadata,
        data: model.data,
        media: { values: fromJson(ListValueSchema, updatedMedia).values } as any,
        embedding: []
      });

      setModel({ ...model, media: updatedMedia });
    } catch (err) {
      console.error("Failed to set cover:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="bg-white border border-slate-200 shadow-sm p-8 rounded-[2.5rem]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">Upload New Media</h2>
            <p className="text-xs font-bold text-slate-500 mt-1">Add featured images or gallery photos for this model.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <button 
              onClick={() => setUploadType("gallery")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                uploadType === "gallery" ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Gallery
            </button>
            <button 
              onClick={() => setUploadType("featured")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                uploadType === "featured" ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Featured
            </button>
          </div>
        </div>

        {isUpdating ? (
          <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Uploading Media...</p>
          </div>
        ) : (
          <MediaUploader 
            onUpload={handleUploadMedia} 
            maxFiles={10} 
            maxSizeMB={15} 
          />
        )}
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 pl-4">Model Gallery</h2>
        <MediaPreview 
          items={model.media || []} 
          onRemove={handleRemoveMedia}
          onSetCover={handleSetCover}
        />
      </div>
    </div>
  );
}
