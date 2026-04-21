import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function OperatorDashboard() {
  const session = await getSession();
  if (!session) redirect('/login');

  const supabase = createServerSupabaseClient();
  
  // Check if user is approved operator
  const { data: cleaner } = await supabase
    .from('cleaners')
    .select('id, name')
    .eq('userId', session.userId)
    .maybeSingle();

  if (!cleaner) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="h-display text-4xl mb-4">Operator Dashboard</h1>
        <p className="text-ink/60 mb-8">
          Not approved yet. Check your email or application status.
        </p>
      </div>
    );
  }

  // Get assigned orders
  const { data: orders } = await supabase
    .from('orders')
    .select('id, code, status, total, createdAt')
    .eq('cleanerId', cleaner.id)
    .order('createdAt', { ascending: false })
    .limit(20);

  // Calculate earnings
  const totalEarnings = orders?.reduce((sum, o) => sum + (o.total * 0.60), 0) || 0;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <h1 className="h-display text-4xl mb-2">Operator Dashboard</h1>
      <p className="text-ink/60 mb-8">Welcome back, {cleaner.name}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-lg bg-bone-soft">
          <div className="text-sm text-ink/60 mb-2">Active Jobs</div>
          <div className="h-display text-4xl">{orders?.filter(o => !['completed', 'cancelled'].includes(o.status)).length || 0}</div>
        </div>
        <div className="p-6 rounded-lg bg-bone-soft">
          <div className="text-sm text-ink/60 mb-2">Total Earnings</div>
          <div className="h-display text-4xl">${totalEarnings.toFixed(0)}</div>
        </div>
        <div className="p-6 rounded-lg bg-bone-soft">
          <div className="text-sm text-ink/60 mb-2">Completed</div>
          <div className="h-display text-4xl">{orders?.filter(o => o.status === 'completed').length || 0}</div>
        </div>
      </div>

      <h2 className="h-display text-2xl mb-4">Recent Orders</h2>
      <div className="space-y-3">
        {orders?.length === 0 && (
          <p className="text-ink/40 text-sm">No orders assigned yet.</p>
        )}
        {orders?.map((order: any) => (
          <div key={order.id} className="p-4 rounded-lg border border-ink/10 flex justify-between items-center">
            <div>
              <div className="font-semibold">{order.code}</div>
              <div className="text-sm text-ink/60">{order.status.replace(/_/g, ' ')}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">${(order.total * 0.60).toFixed(2)}</div>
              <div className="text-xs text-ink/40">Your cut (60%)</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
