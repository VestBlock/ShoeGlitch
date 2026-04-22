import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type {
  GrowthEventPayload,
  GrowthLeadPayload,
  GrowthPageContent,
  GrowthRouteSpec,
  PersistedGrowthPageRecord,
} from '@/lib/growth/types';

function adminSafe() {
  try {
    return createAdminSupabaseClient();
  } catch {
    return null;
  }
}

export async function fetchPersistedGrowthPage(
  routePath: string,
): Promise<PersistedGrowthPageRecord | null> {
  const client = adminSafe();
  if (!client) return null;

  const { data, error } = await client
    .from('growth_generated_pages')
    .select('*')
    .eq('route_path', routePath)
    .maybeSingle();

  if (error || !data) return null;
  return data as PersistedGrowthPageRecord;
}

export async function savePersistedGrowthPage(spec: GrowthRouteSpec, payload: GrowthPageContent) {
  const client = adminSafe();
  if (!client) return;

  await client.from('growth_generated_pages').upsert(
    {
      route_path: spec.path,
      route_kind: spec.kind,
      category_slug: spec.category?.slug ?? null,
      keyword_slug: spec.keyword?.slug ?? null,
      service_slug: spec.service?.slug ?? null,
      location_slug: spec.location.slug,
      neighborhood_slug: spec.neighborhood?.slug ?? null,
      payload,
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'route_path' },
  );
}

export async function recordGrowthLead(payload: GrowthLeadPayload) {
  const client = adminSafe();
  if (!client) return { ok: false, message: 'Supabase admin client is not configured.' };

  const { error } = await client.from('growth_leads').insert({
    route_path: payload.routePath,
    offer: payload.offer,
    name: payload.name ?? null,
    email: payload.email,
    phone: payload.phone ?? null,
    zip: payload.zip ?? null,
    notes: payload.notes ?? null,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: 'Lead captured.' };
}

export async function recordGrowthEvent(payload: GrowthEventPayload) {
  const client = adminSafe();
  if (!client) return;

  await client.from('growth_events').insert({
    route_path: payload.routePath,
    event_name: payload.eventName,
    cta_label: payload.ctaLabel ?? null,
    metadata: payload.metadata ?? {},
    created_at: new Date().toISOString(),
  });
}
