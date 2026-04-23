'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';
import { requireRole } from '@/lib/rbac';
import { db } from '@/lib/db';
import { shortId } from '@/lib/utils';

function slugifyCity(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createCityAction(formData: FormData) {
  const session = await getSession();
  requireRole(session, 'super_admin');

  const name = String(formData.get('name') ?? '').trim();
  const state = String(formData.get('state') ?? '').trim().toUpperCase();
  const requestedSlug = String(formData.get('slug') ?? '').trim();
  const timezone = String(formData.get('timezone') ?? 'America/Chicago').trim();
  const launchDate = String(formData.get('launchDate') ?? '').trim();
  const pickup = Number(formData.get('pickup') ?? 0);
  const rush = Number(formData.get('rush') ?? 0);
  const mailin = Number(formData.get('mailin') ?? 0);
  const hubAddress = String(formData.get('hubAddress') ?? '').trim();
  const active = formData.get('active') === 'on';
  const slug = slugifyCity(requestedSlug || name);

  if (!name || !state || !slug || !launchDate) {
    throw new Error('City name, state, slug, and launch date are required.');
  }

  const existing = await db.cities.bySlug(slug);
  if (existing) {
    throw new Error(`A city with slug "${slug}" already exists.`);
  }

  await db.cities.upsert({
    id: `city_${slug.replace(/-/g, '_') || shortId('city')}`,
    name,
    slug,
    state,
    timezone,
    active,
    launchDate,
    defaultPickupFee: Number.isFinite(pickup) ? pickup : 0,
    defaultRushFee: Number.isFinite(rush) ? rush : 0,
    defaultMailInReturnFee: Number.isFinite(mailin) ? mailin : 0,
    hubAddress: hubAddress || undefined,
  });

  revalidatePath('/admin/cities');
  revalidatePath('/coverage');
  revalidatePath('/locations');
  revalidatePath('/');
}

export async function toggleCityActiveAction(formData: FormData) {
  const session = await getSession();
  requireRole(session, 'super_admin');
  const cityId = String(formData.get('cityId'));
  const city = await db.cities.byId(cityId);
  if (!city) return;
  await db.cities.upsert({ ...city, active: !city.active });
  revalidatePath('/admin/cities');
  revalidatePath('/');
}

export async function updateCityFeesAction(formData: FormData) {
  const session = await getSession();
  requireRole(session, 'super_admin');
  const cityId = String(formData.get('cityId'));
  const city = await db.cities.byId(cityId);
  if (!city) return;
  const pickup = Number(formData.get('pickup') ?? city.defaultPickupFee);
  const rush = Number(formData.get('rush') ?? city.defaultRushFee);
  const mailin = Number(formData.get('mailin') ?? city.defaultMailInReturnFee);
  await db.cities.upsert({
    ...city,
    defaultPickupFee: pickup,
    defaultRushFee: rush,
    defaultMailInReturnFee: mailin,
  });
  revalidatePath('/admin/cities');
}

export async function updateCityPricingAction(formData: FormData) {
  const session = await getSession();
  requireRole(session, 'super_admin');
  const cityId = String(formData.get('cityId'));
  const serviceId = String(formData.get('serviceId'));
  const override = formData.get('override');
  const existing = await db.cityPricing.find(cityId, serviceId);
  if (override === '' || override === null) {
    if (existing) await db.cityPricing.upsert({ ...existing, active: false });
  } else {
    const price = Number(override);
    if (existing) {
      await db.cityPricing.upsert({ ...existing, overridePrice: price, active: true });
    } else {
      await db.cityPricing.upsert({
        id: shortId('csp'),
        cityId,
        serviceId,
        overridePrice: price,
        rushEligible: true,
        active: true,
      });
    }
  }
  revalidatePath('/admin/services');
}

export async function updateBasePriceAction(formData: FormData) {
  const session = await getSession();
  requireRole(session, 'super_admin');
  const serviceId = String(formData.get('serviceId'));
  const basePrice = Number(formData.get('basePrice'));
  const svc = await db.services.byId(serviceId);
  if (!svc) return;
  await db.services.upsert({ ...svc, basePrice });
  revalidatePath('/admin/services');
}
