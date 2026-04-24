import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { RetailMonitorEntry, RetailMonitorHealth } from '@/features/intelligence/monitors/types';

const admin = () => createAdminSupabaseClient();

export type RetailMonitorDiffKind = 'new' | 'returned' | 'missing';

export interface RetailMonitorSnapshotRecord {
  id: string;
  generatedAt: string;
  entryCount: number;
  health: RetailMonitorHealth[];
  createdAt: string;
}

export interface RetailMonitorDiffRecord {
  id: string;
  snapshotId: string;
  source: string;
  sourceLabel: string;
  entryId: string | null;
  diffKind: RetailMonitorDiffKind;
  payload: Record<string, unknown>;
  createdAt: string;
}

function mapSnapshot(row: any): RetailMonitorSnapshotRecord {
  return {
    id: row.id,
    generatedAt: row.generated_at,
    entryCount: row.entry_count ?? 0,
    health: row.health ?? [],
    createdAt: row.created_at,
  };
}

function mapDiff(row: any): RetailMonitorDiffRecord {
  return {
    id: row.id,
    snapshotId: row.snapshot_id,
    source: row.source,
    sourceLabel: row.source_label,
    entryId: row.entry_id,
    diffKind: row.diff_kind,
    payload: row.payload ?? {},
    createdAt: row.created_at,
  };
}

async function tableExists(table: string) {
  try {
    const { error } = await admin().from(table).select('*').limit(1);
    return !error;
  } catch {
    return false;
  }
}

export const retailMonitorStore = {
  async isReady() {
    const [snapshots, entries, diffs] = await Promise.all([
      tableExists('retail_monitor_snapshots'),
      tableExists('retail_monitor_entries'),
      tableExists('retail_monitor_diffs'),
    ]);
    return snapshots && entries && diffs;
  },

  async createSnapshot(input: {
    generatedAt: string;
    entryCount: number;
    health: RetailMonitorHealth[];
  }) {
    const { data, error } = await admin()
      .from('retail_monitor_snapshots')
      .insert({
        generated_at: input.generatedAt,
        entry_count: input.entryCount,
        health: input.health,
      })
      .select('*')
      .single();
    if (error) throw error;
    return mapSnapshot(data);
  },

  async replaceSnapshotEntries(snapshotId: string, entries: RetailMonitorEntry[]) {
    const client = admin();
    const { error: deleteError } = await client.from('retail_monitor_entries').delete().eq('snapshot_id', snapshotId);
    if (deleteError) throw deleteError;
    if (entries.length === 0) return;

    const { error } = await client.from('retail_monitor_entries').insert(
      entries.map((entry) => ({
        snapshot_id: snapshotId,
        entry_id: entry.id,
        source: entry.source,
        source_label: entry.sourceLabel,
        brand: entry.brand,
        model: entry.model,
        name: entry.name,
        colorway: entry.colorway ?? null,
        sku: entry.sku ?? null,
        url: entry.url,
        image_url: entry.imageUrl ?? null,
        release_date: entry.releaseDate ?? null,
        detected_at: entry.detectedAt,
        metadata: entry.metadata,
      })),
    );
    if (error) throw error;
  },

  async latestSnapshot() {
    const { data, error } = await admin()
      .from('retail_monitor_snapshots')
      .select('*')
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? mapSnapshot(data) : null;
  },

  async listEntriesBySnapshot(snapshotId: string) {
    const { data, error } = await admin()
      .from('retail_monitor_entries')
      .select('*')
      .eq('snapshot_id', snapshotId)
      .order('source')
      .order('name');
    if (error) throw error;
    return (data ?? []).map(
      (row): RetailMonitorEntry => ({
        id: row.entry_id,
        source: row.source,
        sourceLabel: row.source_label,
        brand: row.brand,
        model: row.model,
        name: row.name,
        colorway: row.colorway,
        sku: row.sku,
        url: row.url,
        imageUrl: row.image_url,
        releaseDate: row.release_date,
        detectedAt: row.detected_at,
        metadata: row.metadata ?? {},
      }),
    );
  },

  async listKnownEntryIds(limit = 500) {
    const { data, error } = await admin()
      .from('retail_monitor_entries')
      .select('entry_id')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return new Set((data ?? []).map((row) => row.entry_id as string));
  },

  async createDiffs(
    snapshotId: string,
    diffs: Array<{
      source: string;
      sourceLabel: string;
      entryId: string | null;
      diffKind: RetailMonitorDiffKind;
      payload: Record<string, unknown>;
    }>,
  ) {
    if (diffs.length === 0) return [];
    const { data, error } = await admin()
      .from('retail_monitor_diffs')
      .insert(
        diffs.map((diff) => ({
          snapshot_id: snapshotId,
          source: diff.source,
          source_label: diff.sourceLabel,
          entry_id: diff.entryId,
          diff_kind: diff.diffKind,
          payload: diff.payload,
        })),
      )
      .select('*');
    if (error) throw error;
    return (data ?? []).map(mapDiff);
  },

  async listRecentDiffs(limit = 20) {
    const { data, error } = await admin()
      .from('retail_monitor_diffs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(mapDiff);
  },
};

