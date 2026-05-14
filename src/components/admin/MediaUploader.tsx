'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Check, Loader2, AlertCircle, Film } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage } from '@/lib/firebase/client';
import { createMediaItem } from '@/lib/services/media';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';

interface UploadedFile {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
}

interface MediaUploaderProps {
  year: number;
  eventName?: string;
  albumId?: string;
  onUploadComplete?: () => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
}

/**
 * Generates a thumbnail from a File by drawing to an offscreen canvas.
 * Returns a Blob scaled to `maxWidth` px (default 400), preserving aspect ratio.
 */
async function generateThumbnail(file: File, maxWidth = 400): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = maxWidth / img.width;
      const width = maxWidth;
      const height = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob returned null'));
        },
        'image/jpeg',
        0.8
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for thumbnail'));
    };
    img.src = objectUrl;
  });
}

/**
 * Returns natural width/height of an image file.
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read image dimensions'));
    };
    img.src = objectUrl;
  });
}

/**
 * Uploads a single blob to Firebase Storage at the given path,
 * reporting progress via onProgress. Returns the download URL.
 */
function uploadToStorage(
  blob: Blob,
  storagePath: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storage = getFirebaseStorage();
    if (!storage) {
      reject(new Error('Firebase Storage is not configured'));
      return;
    }

    const storageRef = ref(storage, storagePath);
    const task = uploadBytesResumable(storageRef, blob);

    task.on(
      'state_changed',
      (snapshot) => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(pct);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

export function MediaUploader({
  year,
  eventName,
  albumId,
  onUploadComplete,
  accept = { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
  maxFiles = 20,
}: MediaUploaderProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = accepted.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'pending' as const,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const updateFileState = (index: number, patch: Partial<UploadedFile>) => {
    setFiles((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const handleUpload = async () => {
    const pendingFiles = files
      .map((f, i) => ({ ...f, index: i }))
      .filter((f) => f.status === 'pending');

    if (pendingFiles.length === 0) return;

    setUploading(true);

    for (const { file, index } of pendingFiles) {
      try {
        updateFileState(index, { status: 'uploading', progress: 0 });

        const isVideo = file.type.startsWith('video/');
        const uuid = crypto.randomUUID();
        const ext = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');

        if (isVideo) {
          // Video upload — no compression, no thumbnail generation
          const originalPath = `media/${year}/${uuid}_original.${ext}`;

          const originalUrl = await uploadToStorage(file, originalPath, (pct) => {
            updateFileState(index, { progress: Math.round(pct) });
          });

          await createMediaItem({
            type: 'video',
            url: originalUrl,
            thumbnailUrl: '',
            title: file.name.replace(/\.[^.]+$/, ''),
            ...(eventName ? { eventName } : {}),
            ...(albumId ? { albumId } : {}),
            year,
            order: 0,
            isPublished: true,
            isFeatured: false,
            uploadedBy: user?.uid || 'unknown',
          });
        } else {
          // Image upload — compress, generate thumbnail, get dimensions
          const compressed = await imageCompression(file, {
            maxWidthOrHeight: 2400,
            initialQuality: 0.8,
            useWebWorker: true,
            fileType: 'image/jpeg',
          });

          const thumbBlob = await generateThumbnail(file, 400);

          const compressedFile = new File([compressed], file.name, { type: compressed.type });
          const dims = await getImageDimensions(compressedFile);

          const originalPath = `media/${year}/${uuid}_original.${ext}`;
          const thumbPath = `media/${year}/${uuid}_thumb.jpg`;

          const originalUrl = await uploadToStorage(compressed, originalPath, (pct) => {
            updateFileState(index, { progress: Math.round(pct * 0.8) });
          });

          const thumbnailUrl = await uploadToStorage(thumbBlob, thumbPath, (pct) => {
            updateFileState(index, { progress: Math.round(80 + pct * 0.2) });
          });

          await createMediaItem({
            type: 'photo',
            url: originalUrl,
            thumbnailUrl,
            title: file.name.replace(/\.[^.]+$/, ''),
            ...(eventName ? { eventName } : {}),
            ...(albumId ? { albumId } : {}),
            year,
            width: dims.width,
            height: dims.height,
            order: 0,
            isPublished: true,
            isFeatured: false,
            uploadedBy: user?.uid || 'unknown',
          });
        }

        updateFileState(index, { status: 'done', progress: 100 });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        updateFileState(index, { status: 'error', error: message });
      }
    }

    setUploading(false);
    onUploadComplete?.();
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const allDone = files.length > 0 && files.every((f) => f.status === 'done');

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-gamosa-500 bg-gamosa-50'
            : 'border-earth-300 hover:border-gamosa-400 hover:bg-earth-50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 text-earth-400 mx-auto mb-3" />
        <p className="text-sm text-earth-600 font-medium">
          {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to browse'}
        </p>
        <p className="text-xs text-earth-400 mt-1">
          {accept['video/*'] ? 'Images (JPG, PNG, WebP) & Videos (MP4, MOV, WebM)' : 'JPG, PNG, WebP'} — max {maxFiles} files
        </p>
      </div>

      {files.length > 0 && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {files.map((f, i) => (
              <div
                key={i}
                className="relative group aspect-square rounded-lg overflow-hidden bg-earth-100"
              >
                {f.file.type.startsWith('video/') ? (
                  <div className="w-full h-full flex items-center justify-center bg-earth-200">
                    <Film className="h-8 w-8 text-earth-400" />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.preview} alt="" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />

                {/* Progress bar */}
                {f.status === 'uploading' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
                    <div
                      className="h-full bg-gamosa-500 transition-all duration-300"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                )}

                {/* Status indicators */}
                {f.status === 'done' && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                {f.status === 'uploading' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                    <span className="text-white text-xs mt-1">{f.progress}%</span>
                  </div>
                )}
                {f.status === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/50">
                    <AlertCircle className="h-6 w-6 text-white" />
                    <span className="text-white text-xs mt-1 px-1 text-center">
                      {f.error || 'Error'}
                    </span>
                  </div>
                )}

                {/* Remove button - only show for pending or error files */}
                {(f.status === 'pending' || f.status === 'error') && (
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-1 left-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleUpload}
              isLoading={uploading}
              disabled={allDone || pendingCount === 0}
            >
              Upload {pendingCount} File{pendingCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
