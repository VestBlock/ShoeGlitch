'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';

const ApplicationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  cityId: z.string(),
  tier: z.enum(['starter', 'pro', 'luxury']),
  experience: z.string().optional(),
  whyJoin: z.string().optional(),
});

export async function submitApplicationAction(formData: FormData) {
  const parsed = ApplicationSchema.parse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    cityId: formData.get('cityId'),
    tier: formData.get('tier'),
    experience: formData.get('experience') || undefined,
    whyJoin: formData.get('whyJoin') || undefined,
  });

  // TODO: insert into operator_applications table when migrated
  const city = await db.cities.byId(parsed.cityId);
  const ref = `OP-${Math.random().toString(36).toUpperCase().slice(2, 8)}`;

  redirect(`/operator/applied?ref=${ref}&tier=${parsed.tier}&city=${city?.slug ?? ''}`);
}
