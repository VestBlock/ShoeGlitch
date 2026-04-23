'use client';

import { useState, useMemo } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { ApprovalActions } from './ApprovalActions';

export function AdminOperatorsClient({
  applications,
  documentsSetupError,
}: {
  applications: any[];
  documentsSetupError?: string | null;
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return applications;
    
    const q = search.toLowerCase();
    return applications.filter(app => 
      app.name.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      app.phone.includes(q) ||
      app.cities?.name.toLowerCase().includes(q)
    );
  }, [applications, search]);

  return (
    <>
      <div className="mb-6">
        <SearchBar placeholder="Search by name, email, phone, or city..." onSearch={setSearch} />
      </div>

      {documentsSetupError ? (
        <div className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
          License uploads need the operator document migration before admin review links can load.
          <span className="block font-mono text-xs mt-2">{documentsSetupError}</span>
        </div>
      ) : null}

      <div className="space-y-4">
        {filtered.length === 0 && (
          <p className="text-ink/40">No applications found.</p>
        )}
        {filtered.map((app: any) => (
          <div key={app.id} className="p-6 rounded-lg border border-ink/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-semibold text-lg">{app.name}</div>
                <div className="text-sm text-ink/60">{app.email} • {app.phone}</div>
                <div className="text-sm text-ink/60 mt-1">
                  {app.cities?.name || 'Unknown city'} • {app.tier} tier
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-block px-3 py-1 rounded-full text-xs ${
                  app.status === 'approved' ? 'bg-green-100 text-green-800' :
                  app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {app.status}
                </div>
                <div className={`inline-block ml-2 px-3 py-1 rounded-full text-xs ${
                  app.kitPaymentStatus === 'paid' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {app.kitPaymentStatus === 'paid' ? 'Kit Paid' : 'Unpaid'}
                </div>
              </div>
            </div>

            {app.experience && (
              <div className="mb-3">
                <div className="text-xs text-ink/40 uppercase mb-1">Experience</div>
                <div className="text-sm">{app.experience}</div>
              </div>
            )}

            {app.whyJoin && (
              <div className="mb-3">
                <div className="text-xs text-ink/40 uppercase mb-1">Why Join</div>
                <div className="text-sm">{app.whyJoin}</div>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-ink/10 bg-bone-soft p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-ink/40">License verification</div>
                  <div className="mt-1 text-sm font-semibold">
                    {app.licenseDocuments?.length ? 'Driver license uploaded' : 'No license uploaded'}
                  </div>
                  <p className="mt-1 text-xs text-ink/55">
                    Required before approving pickup, drop-off, or cleaning operator access.
                  </p>
                </div>
                {app.licenseDocuments?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {app.licenseDocuments.map((document: any) => (
                      document.signedUrl ? (
                        <a
                          key={document.id}
                          href={document.signedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-outline text-sm"
                        >
                          View license
                        </a>
                      ) : (
                        <span key={document.id} className="rounded-full bg-yellow-100 px-3 py-2 text-xs text-yellow-800">
                          Link unavailable
                        </span>
                      )
                    ))}
                  </div>
                ) : (
                  <span className="rounded-full bg-red-100 px-3 py-2 text-xs font-semibold text-red-800">
                    Missing
                  </span>
                )}
              </div>
            </div>

            {app.status === 'pending' && app.kitPaymentStatus === 'paid' && app.licenseDocuments?.length > 0 && (
              <ApprovalActions applicationId={app.id} />
            )}

            {app.status === 'pending' && app.kitPaymentStatus === 'paid' && !app.licenseDocuments?.length && (
              <p className="text-xs text-red-700 mt-4">Approval is locked until a driver license is uploaded.</p>
            )}

            {app.status === 'pending' && app.kitPaymentStatus !== 'paid' && (
              <p className="text-xs text-ink/40 mt-4">Waiting for kit payment...</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
