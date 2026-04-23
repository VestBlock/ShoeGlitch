import type { City, ServiceArea } from '@/types';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { FALLBACK_SEO_CITIES, getFallbackSeoServiceAreasByCity } from '@/features/seo/fallback-data';

const DEFAULT_SEO_QUERY_TIMEOUT_MS = 5000;

let activeCitiesPromise: Promise<City[]> | null = null;
const serviceAreasByCityPromises = new Map<string, Promise<ServiceArea[]>>();

function getSeoQueryTimeoutMs() {
  const configured = Number(process.env.SEO_SUPABASE_TIMEOUT_MS);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_SEO_QUERY_TIMEOUT_MS;
}

async function runWithSeoTimeout<T>(query: (signal: AbortSignal) => PromiseLike<T>): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getSeoQueryTimeoutMs());

  try {
    return await query(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
}

async function queryActiveCities(): Promise<City[]> {
  const client = createAdminSupabaseClient();
  const { data, error } = await runWithSeoTimeout((signal) =>
    client.from('cities').select('*').eq('active', true).order('name').abortSignal(signal),
  );
  if (error) throw error;
  return (data ?? []) as City[];
}

export async function getActiveSeoCities(): Promise<City[]> {
  if (!activeCitiesPromise) {
    activeCitiesPromise = queryActiveCities()
      .then((cities) => (cities.length > 0 ? cities : FALLBACK_SEO_CITIES))
      .catch(() => FALLBACK_SEO_CITIES);
  }

  return activeCitiesPromise;
}

export async function getSeoCityBySlug(slug: string): Promise<City | undefined> {
  const cities = await getActiveSeoCities();
  return cities.find((city) => city.slug === slug);
}

export async function getSeoServiceAreasByCity(cityId: string): Promise<ServiceArea[]> {
  const cached = serviceAreasByCityPromises.get(cityId);
  if (cached) return cached;

  const promise = (async () => {
    try {
      const client = createAdminSupabaseClient();
      const { data, error } = await runWithSeoTimeout((signal) =>
        client
          .from('service_areas')
          .select('*')
          .eq('cityId', cityId)
          .eq('active', true)
          .order('name')
          .abortSignal(signal),
      );
      if (error) throw error;
      return (data ?? []) as ServiceArea[];
    } catch {
      return getFallbackSeoServiceAreasByCity(cityId);
    }
  })();

  serviceAreasByCityPromises.set(cityId, promise);
  return promise;
}
