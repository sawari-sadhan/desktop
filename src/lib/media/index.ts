import { CONFIG } from "../config";
import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { MediaService } from "../gen/media_pb";

const mediaTransport = createConnectTransport({
  baseUrl: CONFIG.MEDIA.API_URL,
});

export const mediaClient = createClient(MediaService, mediaTransport);

export interface UploadedAsset {
  id: string;
  original_name?: string;
  originalName?: string;
  media_type?: string;
  mediaType?: string;
  mime_type?: string;
  mimeType?: string;
  file_size?: number;
  url: string;
}

/**
 * Uploads media files to the REST /upload endpoint of the Media Service.
 * @param files Array of files to upload
 * @param mediaType e.g., "featured", "gallery", "image", "video", "auto"
 * @returns Array of uploaded asset data from the backend
 */
export async function uploadMediaFiles(files: File[], mediaType: string = "auto") {
  const uploadUrl = `${CONFIG.MEDIA.API_URL}/upload`;
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append("file", file);
  });
  
  formData.append("mediaType", mediaType);

  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Backend upload error:", errorBody);
      throw new Error(`Media upload failed: ${response.statusText}. Details: ${errorBody}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error uploading media:", err);
    throw err;
  }
}

/**
 * Lists media files from the REST /assets endpoint of the Media Service.
 */
export async function listMediaAssets(options: { mediaType?: string; limit?: number; offset?: number } = {}) {
  const params = new URLSearchParams();
  if (options.mediaType && options.mediaType !== 'all') params.append('mediaType', options.mediaType);
  if (options.limit) params.append('limit', String(options.limit));
  if (options.offset) params.append('offset', String(options.offset));

  const url = `${CONFIG.MEDIA.API_URL}/assets?${params.toString()}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { assets: [], total: 0 };
    }
    const data = await response.json();
    return {
      assets: (data.assets || []) as UploadedAsset[],
      total: Number(data.total || 0),
    };
  } catch (err) {
    console.warn("Failed to query /assets from media service:", err);
    return { assets: [], total: 0 };
  }
}

/**
 * Deletes an asset by ID from the Media Service.
 */
export async function deleteMediaAsset(assetId: string) {
  const deleteUrl = `${CONFIG.MEDIA.API_URL}/upload/${assetId}`;
  try {
    const response = await fetch(deleteUrl, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error("Error deleting asset:", err);
    throw err;
  }
}
