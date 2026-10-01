import { CONFIG } from "../config";
import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { MediaService } from "../gen/media_pb";

const mediaTransport = createConnectTransport({
  baseUrl: CONFIG.MEDIA.API_URL,
});

export const mediaClient = createClient(MediaService, mediaTransport);

/**
 * Uploads media files to the REST /upload endpoint of the Media Service.
 * @param files Array of files to upload
 * @param mediaType e.g., "featured", "gallery", "auto"
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
      throw new Error(`Media upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error uploading media:", err);
    throw err;
  }
}
