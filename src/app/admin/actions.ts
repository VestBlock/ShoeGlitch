'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
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

function redirectToCities(message: string, key: 'notice' | 'error' = 'notice'): never {
  redirect(`/admin/cities?${key}=${encodeURIComponent(message)}`);
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
    redirectToCities('City name, state, slug, and launch date are required.', 'error');
  }

  if (state.length !== 2) {
    redirectToCities('Use a two-letter state abbreviation, like IL or GA.', 'error');
  }

  let existing;
  try {
    existing = await db.cities.bySlug(slug);
  } catch (error) {
    console.error('Unable to check city slug before create', error);
    redirectToCities('Could not check the city slug. Try again in a moment.', 'error');
  }

  if (existing) {
    redirectToCities(`A city with slug "${slug}" already exists. Use a different slug.`, 'error');
  }

  try {
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
  } catch (error) {
    console.error('Unable to create city', error);
    redirectToCities('Could not add that city. Check the details and try again.', 'error');
  }

  revalidatePath('/admin/cities');
  revalidatePath('/coverage');
  revalidatePath('/locations');
  revalidatePath('/');
  revalidatePath('/admin/seo');
  revalidatePath('/admin/automation');
  redirectToCities(`${name} was added. Run SEO automation when you want manifests to include the new market.`);
}

export async function toggleCityActiveAction(formData: FormData) {
  const session = await getSession();
  requireRole(session, 'super_admin');
  const cityId = String(formData.get('cityId'));
  const city = await db.cities.byId(cityId);
  if (!city) redirectToCities('That city could not be found.', 'error');
  try {
    await db.cities.upsert({ ...city, active: !city.active });
  } catch (error) {
    console.error('Unable to toggle city active state', error);
    redirectToCities('Could not update that city status. Try again in a moment.', 'error');
  }
  revalidatePath('/admin/cities');
  revalidatePath('/coverage');
  revalidatePath('/locations');
  revalidatePath('/');
  redirectToCities(`${city.name} is now ${city.active ? 'paused' : 'live'}.`);
}

export async function updateCityFeesAction(formData: FormData) {
  const session = await getSession();
  requireRole(session, 'super_admin');
  const cityId = String(formData.get('cityId'));
  const city = await db.cities.byId(cityId);
  if (!city) redirectToCities('That city could not be found.', 'error');
  const pickup = Number(formData.get('pickup') ?? city.defaultPickupFee);
  const rush = Number(formData.get('rush') ?? city.defaultRushFee);
  const mailin = Number(formData.get('mailin') ?? city.defaultMailInReturnFee);
  try {
    await db.cities.upsert({
      ...city,
      defaultPickupFee: Number.isFinite(pickup) ? pickup : city.defaultPickupFee,
      defaultRushFee: Number.isFinite(rush) ? rush : city.defaultRushFee,
      defaultMailInReturnFee: Number.isFinite(mailin) ? mailin : city.defaultMailInReturnFee,
    });
  } catch (error) {
    console.error('Unable to update city fees', error);
    redirectToCities('Could not save those city fees. Try again in a moment.', 'error');
  }
  revalidatePath('/admin/cities');
  revalidatePath('/coverage');
  revalidatePath('/locations');
  redirectToCities(`${city.name} fees were updated.`);
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
