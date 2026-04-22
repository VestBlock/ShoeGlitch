import type { City, ServiceArea } from '@/types';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

async function queryActiveCities(): Promise<City[]> {
  const client = createAdminSupabaseClient();
  const { data, error } = await client.from('cities').select('*').eq('active', true).order('name');
  if (error) throw error;
  return (data ?? []) as City[];
}

export async function getActiveSeoCities(): Promise<City[]> {
  try {
    return await queryActiveCities();
  } catch {
    return [];
  }
}

export async function getSeoCityBySlug(slug: string): Promise<City | undefined> {
  const cities = await getActiveSeoCities();
  return cities.find((city) => city.slug === slug);
}

export async function getSeoServiceAreasByCity(cityId: string): Promise<ServiceArea[]> {
  try {
    const client = createAdminSupabaseClient();
    const { data, error } = await client
      .from('service_areas')
      .select('*')
      .eq('cityId', cityId)
      .eq('active', true)
      .order('name');
    if (error) throw error;
    return (data ?? []) as ServiceArea[];
  } catch {
    return [];
  }
}
