// ==========================================================================
// Supabase DATA LAYER
// Same API surface as the in-memory store, but all functions are async.
// ==========================================================================

import type {
  City,
  ServiceArea,
  Service,
  CityServicePricing,
  User,
  Customer,
  Cleaner,
  CityManager,
  Order,
  OrderEvent,
  Coupon,
} from '@/types';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

type SingleResp<T> = { data: T | null; error: any };
type ListResp<T> = { data: T[] | null; error: any };

function list<T>(res: ListResp<T>): T[] {
  if (res.error) throw res.error;
  return res.data ?? [];
}
function single<T>(res: SingleResp<T>): T | undefined {
  if (res.error) throw res.error;
  return res.data ?? undefined;
}

const server = () => createServerSupabaseClient();
const admin = () => createAdminSupabaseClient();

export const db = {
  // --------------------------------------------------------------- cities
  cities: {
    all: async (): Promise<City[]> => list(await server().from('cities').select('*')),
    active: async (): Promise<City[]> =>
      list(await server().from('cities').select('*').eq('active', true)),
    byId: async (id: string): Promise<City | undefined> =>
      single(await server().from('cities').select('*').eq('id', id).maybeSingle()),
    bySlug: async (slug: string): Promise<City | undefined> =>
      single(await server().from('cities').select('*').eq('slug', slug).maybeSingle()),
    upsert: async (c: City): Promise<void> => {
      const res = await admin().from('cities').upsert(c as any, { onConflict: 'id' });
      if (res.error) throw res.error;
    },
  },

  // --------------------------------------------------------- serviceAreas
  serviceAreas: {
    all: async (): Promise<ServiceArea[]> =>
      list(await server().from('service_areas').select('*')),
    byCity: async (cityId: string): Promise<ServiceArea[]> =>
      list(
        await server()
          .from('service_areas')
          .select('*')
          .eq('cityId', cityId)
          .eq('active', true),
      ),
    byId: async (id: string): Promise<ServiceArea | undefined> =>
      single(await server().from('service_areas').select('*').eq('id', id).maybeSingle()),
    findByZip: async (zip: string): Promise<ServiceArea | undefined> =>
      single(
        await server()
          .from('service_areas')
          .select('*')
          .eq('active', true)
          .contains('zips', [zip])
          .maybeSingle(),
      ),
  },

  // -------------------------------------------------------------- services
  services: {
    all: async (): Promise<Service[]> => list(await server().from('services').select('*')),
    active: async (): Promise<Service[]> =>
      list(await server().from('services').select('*').eq('active', true)),
    primary: async (): Promise<Service[]> =>
      list(
        await server().from('services').select('*').eq('active', true).eq('isAddOn', false),
      ),
    addOns: async (): Promise<Service[]> =>
      list(await server().from('services').select('*').eq('active', true).eq('isAddOn', true)),
    byId: async (id: string): Promise<Service | undefined> =>
      single(await server().from('services').select('*').eq('id', id).maybeSingle()),
    bySlug: async (slug: string): Promise<Service | undefined> =>
      single(await server().from('services').select('*').eq('slug', slug).maybeSingle()),
    upsert: async (s: Service): Promise<void> => {
      const res = await admin().from('services').upsert(s as any, { onConflict: 'id' });
      if (res.error) throw res.error;
    },
  },

  // ---------------------------------------------------------- cityPricing
  cityPricing: {
    forCity: async (cityId: string): Promise<CityServicePricing[]> =>
      list(
        await server()
          .from('city_service_pricing')
          .select('*')
          .eq('cityId', cityId)
          .eq('active', true),
      ),
    find: async (cityId: string, serviceId: string): Promise<CityServicePricing | undefined> =>
      single(
        await server()
          .from('city_service_pricing')
          .select('*')
          .eq('cityId', cityId)
          .eq('serviceId', serviceId)
          .eq('active', true)
          .maybeSingle(),
      ),
    upsert: async (p: CityServicePricing): Promise<void> => {
      const res = await admin()
        .from('city_service_pricing')
        .upsert(p as any, { onConflict: 'id' });
      if (res.error) throw res.error;
    },
  },

  // ----------------------------------------------------------------- users
  // admin() used intentionally: users lookups run during auth bootstrap
  // (login/middleware) and on pages that have already role-gated via
  // requireRole() before calling these.
  users: {
    byEmail: async (email: string): Promise<User | undefined> =>
      single(
        await admin().from('users').select('*').ilike('email', email).maybeSingle(),
      ),
    byId: async (id: string): Promise<User | undefined> =>
      single(await admin().from('users').select('*').eq('id', id).maybeSingle()),
    all: async (): Promise<User[]> => list(await admin().from('users').select('*')),
  },

  // ------------------------------------------------------------- customers
  customers: {
    byUserId: async (userId: string): Promise<Customer | undefined> =>
      single(
        await server().from('customers').select('*').eq('userId', userId).maybeSingle(),
      ),
    byId: async (id: string): Promise<Customer | undefined> =>
      single(await server().from('customers').select('*').eq('id', id).maybeSingle()),
    upsert: async (c: Customer): Promise<void> => {
      const res = await admin().from('customers').upsert(c as any, { onConflict: 'id' });
      if (res.error) throw res.error;
    },
  },

  // -------------------------------------------------------------- cleaners
  cleaners: {
    all: async (): Promise<Cleaner[]> => list(await server().from('cleaners').select('*')),
    byUserId: async (userId: string): Promise<Cleaner | undefined> =>
      single(
        await server().from('cleaners').select('*').eq('userId', userId).maybeSingle(),
      ),
    byId: async (id: string): Promise<Cleaner | undefined> =>
      single(await server().from('cleaners').select('*').eq('id', id).maybeSingle()),
    byCity: async (cityId: string): Promise<Cleaner[]> =>
      list(
        await server()
          .from('cleaners')
          .select('*')
          .eq('cityId', cityId)
          .eq('active', true),
      ),
    upsert: async (c: Cleaner): Promise<void> => {
      const res = await admin().from('cleaners').upsert(c as any, { onConflict: 'id' });
      if (res.error) throw res.error;
    },
  },

  // ---------------------------------------------------------- cityManagers
  cityManagers: {
    byUserId: async (userId: string): Promise<CityManager | undefined> =>
      single(
        await server().from('city_managers').select('*').eq('userId', userId).maybeSingle(),
      ),
    byCityId: async (cityId: string): Promise<CityManager | undefined> =>
      single(
        await server().from('city_managers').select('*').eq('cityId', cityId).maybeSingle(),
      ),
    all: async (): Promise<CityManager[]> =>
      list(await server().from('city_managers').select('*')),
  },

  // ---------------------------------------------------------------- orders
  orders: {
    all: async (): Promise<Order[]> =>
      list(await server().from('orders').select('*').order('createdAt', { ascending: false })),
    byId: async (id: string): Promise<Order | undefined> =>
      single(await server().from('orders').select('*').eq('id', id).maybeSingle()),
    byCustomer: async (customerId: string): Promise<Order[]> =>
      list(
        await server()
          .from('orders')
          .select('*')
          .eq('customerId', customerId)
          .order('createdAt', { ascending: false }),
      ),
    byCity: async (cityId: string): Promise<Order[]> =>
      list(
        await server()
          .from('orders')
          .select('*')
          .eq('cityId', cityId)
          .order('createdAt', { ascending: false }),
      ),
    byCleaner: async (cleanerId: string): Promise<Order[]> =>
      list(
        await server()
          .from('orders')
          .select('*')
          .eq('cleanerId', cleanerId)
          .order('createdAt', { ascending: false }),
      ),
    upsert: async (o: Order): Promise<void> => {
      const res = await admin().from('orders').upsert(o as any, { onConflict: 'id' });
      if (res.error) throw res.error;
    },
  },

  // ----------------------------------------------------------- orderEvents
  orderEvents: {
    forOrder: async (orderId: string): Promise<OrderEvent[]> =>
      list(
        await server()
          .from('order_events')
          .select('*')
          .eq('orderId', orderId)
          .order('createdAt', { ascending: true }),
      ),
    append: async (e: OrderEvent): Promise<void> => {
      const res = await admin().from('order_events').insert(e as any);
      if (res.error) throw res.error;
    },
  },

  // --------------------------------------------------------------- coupons
  coupons: {
    byCode: async (code: string): Promise<Coupon | undefined> =>
      single(
        await server().from('coupons').select('*').ilike('code', code).maybeSingle(),
      ),
    all: async (): Promise<Coupon[]> => list(await server().from('coupons').select('*')),
  },
};
