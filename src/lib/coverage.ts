import { db } from '@/lib/db';

export interface CoverageResult {
  covered: boolean;
  cityId?: string;
  cityName?: string;
  serviceAreaId?: string;
  serviceAreaName?: string;
  mailInAvailable: true;
  reason?: string;
}

export async function checkCoverage(zip: string): Promise<CoverageResult> {
  const cleaned = (zip || '').trim().slice(0, 5);
  if (!/^\d{5}$/.test(cleaned)) {
    return { covered: false, mailInAvailable: true, reason: 'Enter a valid 5-digit ZIP.' };
  }
  const area = await db.serviceAreas.findByZip(cleaned);
  if (!area) {
    return {
      covered: false,
      mailInAvailable: true,
      reason: 'No local coverage yet — but mail-in is always available.',
    };
  }
  const city = await db.cities.byId(area.cityId);
  if (!city || !city.active) {
    return {
      covered: false,
      mailInAvailable: true,
      reason: 'That city is not yet active — mail-in still works.',
    };
  }
  return {
    covered: true,
    cityId: city.id,
    cityName: city.name,
    serviceAreaId: area.id,
    serviceAreaName: area.name,
    mailInAvailable: true,
  };
}
