import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ApprovalActions } from './ApprovalActions';

export default async function AdminOperators() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Check admin role
  const supabase = createServerSupabaseClient();
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.userId)
    .maybeSingle();

  if (user?.role !== 'admin') {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="h-display text-4xl mb-4">Access Denied</h1>
        <p className="text-ink/60">Admin only</p>
      </div>
    );
  }

  // Get pending applications
  const { data: applications } = await supabase
    .from('operator_applications')
    .select('*, cities(name)')
    .order('createdAt', { ascending: false });

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <h1 className="h-display text-4xl mb-8">Operator Applications</h1>

      <div className="space-y-4">
        {applications?.length === 0 && (
          <p className="text-ink/40">No applications yet.</p>
        )}
        {applications?.map((app: any) => (
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
    </div>
  );
}
