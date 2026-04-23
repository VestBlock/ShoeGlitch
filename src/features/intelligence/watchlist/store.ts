import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type {
  AlertDeliveryRecord,
  AlertDeliveryStatus,
  AlertHistoryItem,
  SneakerEventRecord,
  SourceMatchRecord,
  WatchlistItemRecord,
} from '@/features/intelligence/watchlist/types';

const admin = () => createAdminSupabaseClient();

function mapWatchlist(row: any): WatchlistItemRecord {
  return {
    id: row.id,
    userId: row.user_id,
    brand: row.brand,
    model: row.model,
    name: row.name,
    colorway: row.colorway,
    sku: row.sku,
    size: row.size,
    targetPrice: row.target_price,
    alertType: row.alert_type,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapEvent(row: any): SneakerEventRecord {
  return {
    id: row.id,
    source: row.source,
    sourceEventKey: row.source_event_key,
    eventType: row.event_type,
    name: row.name,
    brand: row.brand,
    model: row.model,
    colorway: row.colorway,
    sku: row.sku,
    size: row.size,
    price: row.price,
    currency: row.currency,
    imageUrl: row.image_url,
    marketUrl: row.market_url,
    eventDate: row.event_date,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

function mapDelivery(row: any): AlertDeliveryRecord {
  return {
    id: row.id,
    watchlistItemId: row.watchlist_item_id,
    sneakerEventId: row.sneaker_event_id,
    userId: row.user_id,
    channel: row.channel,
    provider: row.provider,
    deliveryKey: row.delivery_key,
    status: row.status as AlertDeliveryStatus,
    errorMessage: row.error_message,
    payload: row.payload ?? {},
    sentAt: row.sent_at,
    createdAt: row.created_at,
  };
}

export const watchlistStore = {
  async listByUser(userId: string) {
    const { data, error } = await admin()
      .from('watchlist_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapWatchlist);
  },

  async listActive() {
    const { data, error } = await admin()
      .from('watchlist_items')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapWatchlist);
  },

  async listActiveByUser() {
    const items = await this.listActive();
    const grouped = new Map<string, WatchlistItemRecord[]>();
    for (const item of items) {
      const current = grouped.get(item.userId) ?? [];
      current.push(item);
      grouped.set(item.userId, current);
    }
    return grouped;
  },

  async byId(id: string) {
    const { data, error } = await admin().from('watchlist_items').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapWatchlist(data) : null;
  },

  async create(input: Omit<WatchlistItemRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const { data, error } = await admin()
      .from('watchlist_items')
      .insert({
        user_id: input.userId,
        brand: input.brand,
        model: input.model,
        name: input.name ?? null,
        colorway: input.colorway ?? null,
        sku: input.sku ?? null,
        size: input.size ?? null,
        target_price: input.targetPrice ?? null,
        alert_type: input.alertType,
        is_active: input.isActive,
        created_at: now,
        updated_at: now,
      })
      .select('*')
      .single();
    if (error) throw error;
    return mapWatchlist(data);
  },

  async update(id: string, input: Partial<Omit<WatchlistItemRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.brand !== undefined) patch.brand = input.brand;
    if (input.model !== undefined) patch.model = input.model;
    if (input.name !== undefined) patch.name = input.name;
    if (input.colorway !== undefined) patch.colorway = input.colorway;
    if (input.sku !== undefined) patch.sku = input.sku;
    if (input.size !== undefined) patch.size = input.size;
    if (input.targetPrice !== undefined) patch.target_price = input.targetPrice;
    if (input.alertType !== undefined) patch.alert_type = input.alertType;
    if (input.isActive !== undefined) patch.is_active = input.isActive;

    const { data, error } = await admin()
      .from('watchlist_items')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return mapWatchlist(data);
  },

  async remove(id: string) {
    const { error } = await admin().from('watchlist_items').delete().eq('id', id);
    if (error) throw error;
  },

  async upsertEvent(event: SneakerEventRecord) {
    const payload = {
      id: event.id,
      source: event.source,
      source_event_key: event.sourceEventKey,
      event_type: event.eventType,
      name: event.name,
      brand: event.brand,
      model: event.model,
      colorway: event.colorway ?? null,
      sku: event.sku ?? null,
      size: event.size ?? null,
      price: event.price ?? null,
      currency: event.currency,
      image_url: event.imageUrl ?? null,
      market_url: event.marketUrl ?? null,
      event_date: event.eventDate,
      metadata: event.metadata,
    };

    const { data, error } = await admin()
      .from('sneaker_events')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single();
    if (error) throw error;
    return mapEvent(data);
  },

  async createMatch(record: Omit<SourceMatchRecord, 'id' | 'createdAt'>) {
    const { data, error } = await admin()
      .from('source_match_records')
      .insert({
        watchlist_item_id: record.watchlistItemId,
        sneaker_event_id: record.sneakerEventId,
        match_type: record.matchType,
        match_score: record.matchScore,
        explanation: record.explanation,
      })
      .select('*')
      .single();
    if (error) throw error;

    return {
      id: data.id,
      watchlistItemId: data.watchlist_item_id,
      sneakerEventId: data.sneaker_event_id,
      matchType: data.match_type,
      matchScore: Number(data.match_score),
      explanation: data.explanation,
      createdAt: data.created_at,
    } satisfies SourceMatchRecord;
  },

  async findDeliveryByKey(deliveryKey: string) {
    const { data, error } = await admin()
      .from('alert_deliveries')
      .select('*')
      .eq('delivery_key', deliveryKey)
      .maybeSingle();
    if (error) throw error;
    return data ? mapDelivery(data) : null;
  },

  async createDelivery(input: Omit<AlertDeliveryRecord, 'id' | 'createdAt'>) {
    const { data, error } = await admin()
      .from('alert_deliveries')
      .insert({
        watchlist_item_id: input.watchlistItemId,
        sneaker_event_id: input.sneakerEventId,
        user_id: input.userId,
        channel: input.channel,
        provider: input.provider,
        delivery_key: input.deliveryKey,
        status: input.status,
        error_message: input.errorMessage ?? null,
        payload: input.payload,
        sent_at: input.sentAt ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return mapDelivery(data);
  },

  async listAlertHistoryByUser(userId: string, limit = 20): Promise<AlertHistoryItem[]> {
    const { data: deliveries, error: deliveryError } = await admin()
      .from('alert_deliveries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (deliveryError) throw deliveryError;

    const deliveryRows = (deliveries ?? []).map(mapDelivery);
    if (deliveryRows.length === 0) return [];

    const watchlistIds = [...new Set(deliveryRows.map((item) => item.watchlistItemId))];
    const eventIds = [...new Set(deliveryRows.map((item) => item.sneakerEventId))];

    const [{ data: watchlists, error: watchlistError }, { data: events, error: eventError }] = await Promise.all([
      admin().from('watchlist_items').select('*').in('id', watchlistIds),
      admin().from('sneaker_events').select('*').in('id', eventIds),
    ]);

    if (watchlistError) throw watchlistError;
    if (eventError) throw eventError;

    const watchlistMap = new Map((watchlists ?? []).map((row) => [row.id, mapWatchlist(row)]));
    const eventMap = new Map((events ?? []).map((row) => [row.id, mapEvent(row)]));

    return deliveryRows
      .map((delivery) => {
        const watchlistItem = watchlistMap.get(delivery.watchlistItemId);
        const event = eventMap.get(delivery.sneakerEventId);
        if (!watchlistItem || !event) return null;
        return { delivery, watchlistItem, event };
      })
      .filter((item): item is AlertHistoryItem => Boolean(item));
  },

  async getUserProfile(userId: string) {
    const [{ data: userRow, error: userError }, { data: customerRow, error: customerError }] = await Promise.all([
      admin().from('users').select('id, email, name').eq('id', userId).maybeSingle(),
      admin().from('customers').select('id, userId, email, name').eq('userId', userId).maybeSingle(),
    ]);
    if (userError) throw userError;
    if (customerError) throw customerError;

    const email = customerRow?.email ?? userRow?.email ?? null;
    const name = customerRow?.name ?? userRow?.name ?? 'Shoe Glitch customer';

    if (!email) return null;
    return { email, name };
  },
};
