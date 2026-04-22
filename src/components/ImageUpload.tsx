'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadOrderPhotos, type UploadOrderPhotoPhase } from '@/lib/storage';

interface ImageUploadProps {
  orderId?: string;
  maxFiles?: number;
  onUploadComplete?: (urls: string[]) => void;
  phase?: UploadOrderPhotoPhase;
  buttonLabel?: string;
  uploadLabel?: string;
  helperText?: string;
}

export function ImageUpload({
  orderId,
  maxFiles = 5,
  onUploadComplete,
  phase = 'before',
  buttonLabel,
  uploadLabel,
  helperText,
}: ImageUploadProps) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    if (selected.length + files.length > maxFiles) {
      setError(`Max ${maxFiles} photos allowed`);
      return;
    }

    setFiles((prev) => [...prev, ...selected]);
    
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setPreviews((p) => [...p, reader.result as string]);
      reader.readAsDataURL(file);
    });
    
    setError(null);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleUpload() {
    if (!orderId) {
      setError('Order ID required');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const urls = await uploadOrderPhotos(files, orderId, phase);
      onUploadComplete?.(urls);
      setFiles([]);
      setPreviews([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      {helperText ? <p className="text-sm text-ink/60">{helperText}</p> : null}
      <div className="flex items-center gap-3">
        <label className="btn-outline cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading || files.length >= maxFiles}
          />
          {buttonLabel ?? `Add photos (${files.length}/${maxFiles})`}
        </label>
        
        {files.length > 0 && orderId && (
          <button onClick={handleUpload} disabled={uploading} className="btn-primary">
            {uploading ? 'Uploading...' : uploadLabel ?? 'Upload'}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((preview, i) => (
            <div key={i} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-32 object-cover rounded" />
              <button
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
