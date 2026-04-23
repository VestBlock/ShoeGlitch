'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { headers } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import { sendOperatorApplicationAdminAlert, sendOperatorApplicationConfirmation } from '@/lib/email';
import { db } from '@/lib/db';
import { recordGrowthEvent } from '@/lib/growth/persistence';
import {
  uploadOperatorLicenseDocument,
  validateOperatorLicenseFile,
} from '@/lib/operator-documents';

const ApplicationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  cityId: z.string(),
  tier: z.enum(['starter', 'pro', 'luxury']),
  experience: z.string().optional(),
  whyJoin: z.string().optional(),
});

const TIER_PRICES = {
  starter: 349,
  pro: 599,
  luxury: 899,
} as const;

export async function submitApplicationAction(formData: FormData) {
  const licenseFile = formData.get('licenseFile');
  const parsedLicenseFile = licenseFile instanceof File ? licenseFile : null;
  validateOperatorLicenseFile(parsedLicenseFile);
  if (!parsedLicenseFile) {
    throw new Error('A driver license upload is required for operator review.');
  }

  const parsed = ApplicationSchema.parse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    cityId: formData.get('cityId'),
    tier: formData.get('tier'),
    experience: formData.get('experience') || undefined,
    whyJoin: formData.get('whyJoin') || undefined,
  });

  const supabase = createServerSupabaseClient();
  
  // Insert application
  const { data: app, error } = await supabase
    .from('operator_applications')
    .insert({
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      cityId: parsed.cityId,
      tier: parsed.tier,
      experience: parsed.experience,
      whyJoin: parsed.whyJoin,
      status: 'pending',
      kitPaymentStatus: 'unpaid',
    })
    .select('id')
    .single();

  if (error) throw error;

  try {
    await uploadOperatorLicenseDocument({
      applicationId: app.id,
      file: parsedLicenseFile,
    });
  } catch (documentError) {
    await supabase
      .from('operator_applications')
      .delete()
      .eq('id', app.id);
    throw documentError;
  }

  await recordGrowthEvent({
    routePath: '/become-an-operator',
    eventName: 'operator_interest',
    metadata: {
      applicationId: app.id,
      cityId: parsed.cityId,
      tier: parsed.tier,
    },
  });

  try {
    const cities = await db.cities.all();
    const cityName =
      cities.find((city) => city.id === parsed.cityId)?.name ?? 'your city';

    await Promise.all([
      sendOperatorApplicationAdminAlert({
        applicationId: app.id,
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        cityName,
        tier: parsed.tier,
        experience: parsed.experience ?? null,
        whyJoin: parsed.whyJoin ?? null,
        licenseUploaded: true,
      }),
      sendOperatorApplicationConfirmation({
        applicationId: app.id,
        toEmail: parsed.email,
        name: parsed.name,
        cityName,
        tier: parsed.tier,
        licenseUploaded: true,
      }),
    ]);
  } catch (emailError) {
    console.error('[email] operator application notification failed:', emailError);
  }

  // Create Stripe checkout for kit payment
  const stripe = getStripe();
  const headersList = headers();
  const proto = headersList.get('x-forwarded-proto') || 'https';
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'shoeglitch.com';
  const origin = `${proto}://${host}`;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${parsed.tier.charAt(0).toUpperCase() + parsed.tier.slice(1)} Operator Kit`,
            description: `One-time kit fee for ${parsed.tier} tier operator`,
          },
          unit_amount: TIER_PRICES[parsed.tier] * 100,
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/operator/applied?session_id={CHECKOUT_SESSION_ID}&ref=${encodeURIComponent(app.id)}&paid=1&tier=${parsed.tier}`,
    cancel_url: `${origin}/operator/apply?tier=${parsed.tier}`,
    customer_email: parsed.email,
    metadata: {
      applicationId: app.id,
      tier: parsed.tier,
    },
    payment_intent_data: {
      metadata: {
        applicationId: app.id,
        tier: parsed.tier,
      },
    },
  });

  // Update application with session ID
  await supabase
    .from('operator_applications')
    .update({ stripeCheckoutSessionId: session.id })
    .eq('id', app.id);

  redirect(session.url!);
}
