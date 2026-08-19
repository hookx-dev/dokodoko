/**
 * Uploads an image to Cloudflare R2 via presigned URL.
 * 
 * @param file The image file to upload
 * @param onProgress Optional callback to track upload progress (0-100).
 * @returns Promise that resolves to the public download URL string.
 */
export async function uploadPinImage(file: File, onProgress?: (progress: number) => void): Promise<string> {
  // 1. Get presigned URL from API
  if (onProgress) onProgress(10);
  
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || "application/octet-stream",
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to get presigned URL");
  }

  const { signedUrl, publicUrl } = await res.json();
  
  if (onProgress) onProgress(30);

  if (!publicUrl) {
    throw new Error("NEXT_PUBLIC_R2_PUBLIC_URL is not configured properly.");
  }

  // 2. Upload directly to R2 using XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        // The actual file upload represents 30% -> 100% of the progress
        const percentComplete = 30 + (event.loaded / event.total) * 70;
        onProgress(Math.round(percentComplete));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        resolve(publicUrl);
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.send(file);
  });
}
