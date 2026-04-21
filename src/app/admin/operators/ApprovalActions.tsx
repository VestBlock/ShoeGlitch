'use client';

import { useState } from 'react';
import { approveOperatorAction, rejectOperatorAction } from './actions';

export function ApprovalActions({ applicationId }: { applicationId: string }) {
  const [processing, setProcessing] = useState(false);

  async function handleApprove() {
    setProcessing(true);
    try {
      await approveOperatorAction(applicationId);
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve');
      setProcessing(false);
    }
  }

  async function handleReject() {
    if (!confirm('Reject this application? This cannot be undone.')) return;
    
    setProcessing(true);
    try {
      await rejectOperatorAction(applicationId);
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject');
      setProcessing(false);
    }
  }

  return (
    <div className="flex gap-3 mt-4">
      <button
        onClick={handleApprove}
        disabled={processing}
        className="btn-primary"
      >
        {processing ? 'Processing...' : 'Approve & Create Cleaner'}
      </button>
      <button
        onClick={handleReject}
        disabled={processing}
        className="btn-outline"
      >
        Reject
      </button>
    </div>
  );
}
