import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { getSession } from '@/lib/session';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { AdminOperatorsClient } from './AdminOperatorsClient';

export default async function AdminOperators() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'super_admin') redirect('/login');

  const admin = createAdminSupabaseClient();
  const { data: applications } = await admin
    .from('operator_applications')
    .select('*, cities(name)')
    .order('createdAt', { ascending: false });

  return (
    <DashboardShell currentPath="/admin/operators" pageTitle="Operator applications">
      <AdminOperatorsClient applications={applications || []} />
    </DashboardShell>
  );
}
