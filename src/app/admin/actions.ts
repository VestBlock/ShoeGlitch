'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';
import { requireRole } from '@/lib/rbac';
import { db } from '@/lib/db';
import { shortId } from '@/lib/utils';

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
