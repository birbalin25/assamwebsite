'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Check, Loader2, Film, ImageIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage } from '@/lib/firebase/client';
import { cn } from '@/lib/utils/cn';
import { VideoThumbnail } from '@/components/admin/VideoThumbnail';

interface FileUploadFieldProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  multiple?: boolean;
  type?: 'image' | 'video' | 'both';
  storagePath?: string;
  helperText?: string;
}

interface UploadingFile {
  name: string;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

function uploadToStorage(
  blob: Blob,
  storagePath: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storage = getFirebaseStorage();
    if (!storage) {
      reject(new Error('Firebase Storage not configured'));
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

export function FileUploadField({
  label,
  value,
  onChange,
  multiple = false,
  type = 'image',
  storagePath = 'uploads',
  helperText,
}: FileUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteUrl, setPasteUrl] = useState('');
  const [multiFiles, setMultiFiles] = useState<UploadingFile[]>([]);

  const acceptMap: Record<string, Record<string, string[]>> = {
    image: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    video: { 'video/*': ['.mp4', '.mov', '.webm'] },
    both: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'], 'video/*': ['.mp4', '.mov', '.webm'] },
  };

  const onDrop = useCallback(async (accepted: File[]) => {
    if (accepted.length === 0) return;

    if (multiple) {
      // Multi-file upload mode
      setUploading(true);
      setError(null);
      const fileStates = accepted.map(f => ({ name: f.name, progress: 0, status: 'uploading' as const }));
      setMultiFiles(fileStates);

      for (let i = 0; i < accepted.length; i++) {
        const file = accepted[i];
        try {
          const uuid = crypto.randomUUID();
          const ext = file.name.split('.').pop() || 'bin';
          const isImage = file.type.startsWith('image/');

          let uploadBlob: Blob = file;
          if (isImage) {
            uploadBlob = await imageCompression(file, {
              maxWidthOrHeight: 2400,
              initialQuality: 0.85,
              useWebWorker: true,
            });
          }

          const path = `${storagePath}/${uuid}.${ext}`;
          const url = await uploadToStorage(uploadBlob, path, (pct) => {
            setMultiFiles(prev => prev.map((f, j) => j === i ? { ...f, progress: Math.round(pct) } : f));
          });

          setMultiFiles(prev => prev.map((f, j) => j === i ? { ...f, status: 'done', progress: 100 } : f));
          onChange(url);
        } catch (err) {
          setMultiFiles(prev => prev.map((f, j) => j === i ? { ...f, status: 'error', error: err instanceof Error ? err.message : 'Failed' } : f));
        }
      }

      setUploading(false);
      // Clear the file list after a short delay
      setTimeout(() => setMultiFiles([]), 2000);
    } else {
      // Single file upload mode
      const file = accepted[0];
      setError(null);
      setUploading(true);
      setProgress(0);

      try {
        const uuid = crypto.randomUUID();
        const ext = file.name.split('.').pop() || 'bin';
        const isImage = file.type.startsWith('image/');

        let uploadBlob: Blob = file;
        if (isImage) {
          uploadBlob = await imageCompression(file, {
            maxWidthOrHeight: 2400,
            initialQuality: 0.85,
            useWebWorker: true,
          });
        }

        const path = `${storagePath}/${uuid}.${ext}`;
        const url = await uploadToStorage(uploadBlob, path, (pct) => {
          setProgress(Math.round(pct));
        });

        onChange(url);
        setUploading(false);
        setProgress(100);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
        setUploading(false);
      }
    }
  }, [storagePath, onChange, multiple]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptMap[type],
    maxFiles: multiple ? 20 : 1,
    multiple,
    disabled: uploading,
  });

  const handlePasteSubmit = () => {
    if (pasteUrl.trim()) {
      onChange(pasteUrl.trim());
      setPasteMode(false);
      setPasteUrl('');
    }
  };

  const handleRemove = () => {
    onChange('');
    setProgress(0);
    setError(null);
  };

  const isImageValue = value && (value.match(/\.(jpg|jpeg|png|webp|gif)/i) || value.includes('firebasestorage.googleapis.com'));
  const isVideoValue = value && (value.match(/\.(mp4|mov|webm)/i) || value.includes('youtube.com') || value.includes('youtu.be') || value.includes('vimeo.com'));

  return (
    <div>
      <label className="block text-sm font-medium text-earth-700 mb-1.5">{label}</label>

      {/* Current value preview (single mode only) */}
      {value && !multiple && (
        <div className="mb-3 relative group">
          {isImageValue && !isVideoValue ? (
            <div className="relative w-full h-40 rounded-lg overflow-hidden bg-earth-100 border border-earth-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="" className="w-full h-full object-contain" />
            </div>
          ) : isVideoValue ? (
            <div className="relative w-full h-40 rounded-lg overflow-hidden bg-earth-900 border border-earth-200 flex flex-col items-center justify-center gap-2">
              <VideoThumbnail url={value} className="w-40 h-28" />
              <p className="text-earth-400 text-xs max-w-[200px] truncate">{value}</p>
            </div>
          ) : (
            <div className="relative w-full h-20 rounded-lg bg-earth-100 border border-earth-200 flex items-center px-4">
              <p className="text-earth-600 text-sm truncate">{value}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5 text-white" />
          </button>
        </div>
      )}

      {/* Upload / Paste toggle */}
      {(!value || multiple) && !uploading && (
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setPasteMode(false)}
            className={cn(
              'text-xs px-3 py-1 rounded-full border transition-colors',
              !pasteMode ? 'bg-gamosa-500 text-white border-gamosa-500' : 'text-earth-500 border-earth-300 hover:border-earth-400'
            )}
          >
            Upload {multiple ? 'Files' : 'File'}
          </button>
          <button
            type="button"
            onClick={() => setPasteMode(true)}
            className={cn(
              'text-xs px-3 py-1 rounded-full border transition-colors',
              pasteMode ? 'bg-gamosa-500 text-white border-gamosa-500' : 'text-earth-500 border-earth-300 hover:border-earth-400'
            )}
          >
            Paste URL
          </button>
        </div>
      )}

      {/* Paste URL mode */}
      {(!value || multiple) && pasteMode && !uploading && (
        <div className="flex gap-2">
          <input
            type="url"
            value={pasteUrl}
            onChange={(e) => setPasteUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=... or image URL"
            className="flex-1 rounded-lg border border-earth-300 px-3 py-2 text-sm text-earth-800 placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-gamosa-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handlePasteSubmit}
            disabled={!pasteUrl.trim()}
            className="px-4 py-2 bg-gamosa-500 text-white text-sm rounded-lg hover:bg-gamosa-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
      )}

      {/* Drop zone */}
      {(!value || multiple) && !pasteMode && !uploading && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            isDragActive ? 'border-gamosa-500 bg-gamosa-50' : 'border-earth-300 hover:border-gamosa-400 hover:bg-earth-50'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex items-center justify-center gap-2 mb-1">
            {type === 'video' || type === 'both' ? <Film className="h-5 w-5 text-earth-400" /> : null}
            <ImageIcon className="h-5 w-5 text-earth-400" />
            <Upload className="h-5 w-5 text-earth-400" />
          </div>
          <p className="text-sm text-earth-600 font-medium">
            {isDragActive ? 'Drop files here...' : multiple ? 'Drag & drop files here, or click to select multiple' : 'Drag & drop or click to browse'}
          </p>
          <p className="text-xs text-earth-400 mt-1">
            {type === 'image' && 'JPG, PNG, WebP'}
            {type === 'video' && 'MP4, MOV, WebM'}
            {type === 'both' && 'Images (JPG, PNG, WebP) or Videos (MP4, MOV, WebM)'}
            {multiple && ' — select multiple files'}
          </p>
        </div>
      )}

      {/* Multi-file upload progress */}
      {uploading && multiple && multiFiles.length > 0 && (
        <div className="border border-earth-200 rounded-lg p-4 space-y-2">
          {multiFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              {f.status === 'uploading' && <Loader2 className="h-4 w-4 text-gamosa-500 animate-spin shrink-0" />}
              {f.status === 'done' && <Check className="h-4 w-4 text-green-500 shrink-0" />}
              {f.status === 'error' && <X className="h-4 w-4 text-red-500 shrink-0" />}
              <span className="text-sm text-earth-600 truncate flex-1">{f.name}</span>
              <span className="text-xs text-earth-400 shrink-0">{f.progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Single file upload progress */}
      {uploading && !multiple && (
        <div className="border border-earth-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="h-5 w-5 text-gamosa-500 animate-spin" />
            <span className="text-sm text-earth-600">Uploading... {progress}%</span>
          </div>
          <div className="h-1.5 bg-earth-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gamosa-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p className="text-xs text-earth-400 mt-1">{helperText}</p>
      )}
    </div>
  );
}
