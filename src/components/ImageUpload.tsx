'use client';

import { useState } from 'react';
import { uploadOrderPhoto } from '@/lib/storage';

interface ImageUploadProps {
  orderId?: string;
  maxFiles?: number;
  onUploadComplete?: (urls: string[]) => void;
}

export function ImageUpload({ orderId, maxFiles = 5, onUploadComplete }: ImageUploadProps) {
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
      const urls = await Promise.all(files.map((f) => uploadOrderPhoto(f, orderId)));
      onUploadComplete?.(urls);
      setFiles([]);
      setPreviews([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
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
          Add Photos ({files.length}/{maxFiles})
        </label>
        
        {files.length > 0 && orderId && (
          <button onClick={handleUpload} disabled={uploading} className="btn-primary">
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((preview, i) => (
            <div key={i} className="relative group">
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
