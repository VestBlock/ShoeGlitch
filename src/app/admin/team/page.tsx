import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { Badge, Card } from '@/components/ui';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { formatDateOnly } from '@/lib/utils';

export default async function AdminTeam() {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') redirect('/login');

  const [cleaners, managers, allUsers, cities, allAreas] = await Promise.all([
    db.cleaners.all(),
    db.cityManagers.all(),
    db.users.all(),
    db.cities.all(),
    db.serviceAreas.all(),
  ]);
  const admins = allUsers.filter((u) => u.role === 'super_admin');
  const customers = allUsers.filter((u) => u.role === 'customer');

  const cityMap = new Map(cities.map((c) => [c.id, c]));
  const areaMap = new Map(allAreas.map((a) => [a.id, a]));
  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  // Resolve default city for each customer
  const customerRows = await Promise.all(
    customers.map(async (u) => {
      const c = await db.customers.byUserId(u.id);
      const city = c?.defaultCityId ? cityMap.get(c.defaultCityId) : null;
      return { user: u, customer: c, city };
    }),
  );

  return (
    <DashboardShell currentPath="/admin/team" pageTitle="Team & roles">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        <Stat label="Super admins" value={admins.length} />
        <Stat label="City managers" value={managers.length} />
        <Stat label="Cleaners" value={cleaners.length} />
        <Stat label="Customers" value={customers.length} />
      </div>

      <section className="mb-10">
        <h2 className="h-display text-3xl mb-5">Cleaners</h2>
        <div className="card p-6 overflow-x-auto">
          <table className="sg">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Territories</th>
                <th>Specializations</th>
                <th>Jobs</th>
                <th>Rating</th>
                <th>Payout</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cleaners.map((c) => {
                const city = cityMap.get(c.cityId);
                return (
                  <tr key={c.id}>
                    <td className="font-semibold">{c.name}<div className="text-xs text-ink/40 font-mono">{c.email}</div></td>
                    <td>{city?.name}</td>
                    <td className="text-xs">{c.serviceAreaIds.map((id) => areaMap.get(id)?.name).filter(Boolean).join(', ')}</td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {c.specializations.map(s => <span key={s} className="badge text-[9px]">{s}</span>)}
                      </div>
                    </td>
                    <td className="font-mono">{c.activeJobCount}</td>
                    <td>★ {c.rating}</td>
                    <td className="font-mono">{Math.round(c.payoutRate * 100)}%</td>
                    <td className="text-xs text-ink/50">{formatDateOnly(c.createdAt)}</td>
                    <td>{c.active ? <Badge tone="acid">Active</Badge> : <Badge>Paused</Badge>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="h-display text-3xl mb-5">City managers</h2>
        <div className="card p-6 overflow-x-auto">
          <table className="sg">
            <thead>
              <tr>
                <th>Manager</th>
                <th>City</th>
                <th>Pricing control</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((m) => {
                const user = userMap.get(m.userId);
                const city = cityMap.get(m.cityId);
                return (
                  <tr key={m.id}>
                    <td className="font-semibold">{user?.name}<div className="text-xs text-ink/40 font-mono">{user?.email}</div></td>
                    <td>{city?.name}, {city?.state}</td>
                    <td>{m.canOverridePricing ? <Badge tone="acid">Yes</Badge> : <Badge>No</Badge>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="h-display text-3xl mb-5">Customers</h2>
        <div className="card p-6 overflow-x-auto">
          <table className="sg">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Default city</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {customerRows.map(({ user, city }) => (
                <tr key={user.id}>
                  <td className="font-semibold">{user.name}</td>
                  <td className="font-mono text-xs">{user.email}</td>
                  <td>{city?.name ?? '—'}</td>
                  <td className="text-xs text-ink/50">{formatDateOnly(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: number | string | number; value: number }) {
  return (
    <Card>
      <div className="font-mono text-xs text-ink/40 mb-1">{String(label)}</div>
      <div className="h-display text-5xl">{value}</div>
    </Card>
  );
}
