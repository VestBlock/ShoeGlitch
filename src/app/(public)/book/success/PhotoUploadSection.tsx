'use client';

import { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';

export function PhotoUploadSection({ orderId }: { orderId: string }) {
  const [uploadedCount, setUploadedCount] = useState(0);

  return (
    <div className="rounded-card bg-bone-soft p-6 mb-8 text-left">
      <h3 className="font-semibold mb-2">Need to add more reference photos?</h3>
      <p className="text-sm text-ink/60 mb-4">
        If you forgot a detail before checkout, you can still attach up to five intake photos here and they will appear in the customer, operator, and admin views for this order.
      </p>

      {uploadedCount > 0 ? (
        <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          Added {uploadedCount} additional photo{uploadedCount === 1 ? '' : 's'}.
        </div>
      ) : null}

      <ImageUpload
        orderId={orderId}
        phase="before"
        buttonLabel="Add intake photos"
        uploadLabel="Attach to order"
        onUploadComplete={(urls) => setUploadedCount(urls.length)}
      />
    </div>
  );
}
