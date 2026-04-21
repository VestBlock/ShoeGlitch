import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AdminOperatorsClient } from './AdminOperatorsClient';

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
      <AdminOperatorsClient applications={applications || []} />
    </div>
  );
}
