import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { getSession } from '@/lib/session';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { AdminOperatorsClient } from './AdminOperatorsClient';
import { getOperatorApplicationDocuments } from '@/lib/operator-documents';

export default async function AdminOperators() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'super_admin') redirect('/login');

  const admin = createAdminSupabaseClient();
  const { data: applications } = await admin
    .from('operator_applications')
    .select('*, cities(name)')
    .order('createdAt', { ascending: false });

  const applicationRows = applications || [];
  let documentsByApplication = new Map<string, any[]>();
  let documentsSetupError: string | null = null;
  try {
    documentsByApplication = await getOperatorApplicationDocuments(
      applicationRows.map((application: any) => application.id),
    );
  } catch (error) {
    documentsSetupError =
      error instanceof Error ? error.message : 'Operator document storage is not ready.';
  }
  const applicationsWithDocuments = applicationRows.map((application: any) => ({
    ...application,
    licenseDocuments: documentsByApplication.get(application.id) ?? [],
  }));

  return (
    <DashboardShell currentPath="/admin/operators" pageTitle="Operator applications">
      <AdminOperatorsClient
        applications={applicationsWithDocuments}
        documentsSetupError={documentsSetupError}
      />
    </DashboardShell>
  );
}
