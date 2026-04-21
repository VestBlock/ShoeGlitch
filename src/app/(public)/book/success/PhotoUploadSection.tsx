'use client';

import { useState } from 'react';
import { uploadOrderPhoto } from '@/lib/storage';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';

export function PhotoUploadSection({ orderId }: { orderId: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    if (selected.length + files.length > 5) {
      setError('Max 5 photos');
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
    setUploading(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      
      for (const file of files) {
        // Upload to storage
        const url = await uploadOrderPhoto(file, orderId);
        const storageKey = url.split('/').pop() || '';
        
        // Save to database
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        await supabase.from('order_photos').insert({
          orderId,
          uploadedBy: user.id,
          storageKey,
          url,
        });
      }

      setUploaded(true);
      setFiles([]);
      setPreviews([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  if (uploaded) {
    return (
      <div className="p-6 rounded-lg bg-green-50 text-green-800 text-center mb-8">
        ✓ Photos uploaded successfully
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg bg-bone-soft mb-8">
      <h3 className="font-semibold mb-2">Upload shoe photos (optional)</h3>
      <p className="text-sm text-ink/60 mb-4">
        Help us prepare — upload photos of your shoes before we pick them up.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <label className="btn-outline cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading || files.length >= 5}
          />
          Add Photos ({files.length}/5)
        </label>
        
        {files.length > 0 && (
          <button onClick={handleUpload} disabled={uploading} className="btn-primary">
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

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
