'use client';

import { useState, useMemo } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { ApprovalActions } from './ApprovalActions';

export function AdminOperatorsClient({ applications }: { applications: any[] }) {
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

            {app.status === 'pending' && app.kitPaymentStatus === 'paid' && (
              <ApprovalActions applicationId={app.id} />
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
