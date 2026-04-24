'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/rbac';
import { getSession } from '@/lib/session';
import { runMockWatchlistScan } from '@/features/intelligence/watchlist/service';
import { persistRetailMonitorSnapshot } from '@/features/intelligence/monitors/service';

export async function runWatchlistScanAction() {
  const session = await getSession();
  requireRole(session, 'super_admin');
  await runMockWatchlistScan();
  revalidatePath('/admin/intelligence');
  revalidatePath('/customer/watchlist');
}

export async function runRetailMonitorRefreshAction() {
  const session = await getSession();
  requireRole(session, 'super_admin');
  await persistRetailMonitorSnapshot();
  revalidatePath('/admin/intelligence');
}
