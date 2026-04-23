// ==========================================================================
// EMAIL
// Resend client + transactional email helpers.
//
// RESEND_API_KEY must be set in the environment. The `from` domain must be
// verified in Resend (shoeglitch.com). Emails are sent server-side only.
//
// All helpers are fire-and-forget: they log errors but never throw, so an
// email failure never blocks a Stripe webhook or a server action.
// ==========================================================================

import { Resend } from 'resend';
import {
  extractPickupWindowFromNotes,
  pickupWindowLabel,
} from '@/lib/pickup-window';
import { getOperatorTierDefinition } from '@/features/operators/tiers';
import type { Order, Customer, City, Cleaner } from '@/types';

const FROM = 'Shoe Glitch <contact@shoeglitch.com>';
const REPLY_TO = 'contact@shoeglitch.com';
const SITE_URL = 'https://shoeglitch.com';

function getAdminAlertRecipients() {
  const raw = process.env.ADMIN_ALERT_EMAILS ?? process.env.ADMIN_ALERT_EMAIL ?? 'contact@shoeglitch.com';
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[email] RESEND_API_KEY not configured — email is disabled');
    return null;
  }
  _resend = new Resend(key);
  return _resend;
}

export async function sendAdminSystemAlert(params: {
  subject: string;
  badge?: string;
  heading: string;
  body: string;
  cta?: { href: string; label: string };
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const recipients = getAdminAlertRecipients();
  if (recipients.length === 0) return;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: recipients,
      replyTo: REPLY_TO,
      subject: params.subject,
      html: simpleShell({
        badge: params.badge ?? 'Admin alert',
        heading: params.heading,
        body: params.body,
        cta: params.cta,
      }),
      text: [
        params.heading,
        '',
        params.body.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
        params.cta ? `\n${params.cta.label}: ${params.cta.href}` : null,
        '',
        '— Shoe Glitch',
      ]
        .filter(Boolean)
        .join('\n'),
    });
    if (error) {
      console.error('[email] resend error on sendAdminSystemAlert:', error);
    }
  } catch (err: any) {
    console.error('[email] exception in sendAdminSystemAlert:', err?.message ?? err);
  }
}

/**
 * Send order confirmation email after successful payment.
 * Safe to call from webhook handlers — never throws.
 */
export async function sendOrderConfirmation(params: {
  order: Order;
  customer: Customer;
  city: City | null;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const { order, customer, city } = params;
  const primary = order.items.find((i) => !i.isAddOn);
  const addOns = order.items.filter((i) => i.isAddOn);

  const subject = `Order confirmed — ${order.code} · Shoe Glitch`;

  const html = renderOrderConfirmationHtml({ order, customer, city, primary, addOns });
  const text = renderOrderConfirmationText({ order, customer, city, primary, addOns });

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: customer.email,
      replyTo: REPLY_TO,
      subject,
      html,
      text,
    });
    if (error) {
      console.error('[email] resend error on sendOrderConfirmation:', error);
    } else {
      console.log(`[email] sent order confirmation to ${customer.email} for ${order.code}`);
    }
  } catch (err: any) {
    console.error('[email] exception in sendOrderConfirmation:', err?.message ?? err);
  }
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

function renderOrderConfirmationHtml(args: {
  order: Order;
  customer: Customer;
  city: City | null;
  primary: { serviceName: string; unitPrice: number } | undefined;
  addOns: Array<{ serviceName: string; unitPrice: number }>;
}): string {
  const { order, customer, city, primary, addOns } = args;
  const pickupWindow = pickupWindowLabel(extractPickupWindowFromNotes(order.notes));
  const addOnRows = addOns
    .map(
      (a) => `
    <tr>
      <td style="padding:6px 0;color:#4B5563;">+ ${escapeHtml(a.serviceName)}</td>
      <td style="padding:6px 0;text-align:right;color:#4B5563;">$${a.unitPrice}</td>
    </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Order confirmed — ${escapeHtml(order.code)}</title>
  </head>
  <body style="margin:0;padding:0;background:#F4F7FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0A0F1F;">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <div style="text-align:center;padding:24px 0;">
        <div style="font-size:28px;font-weight:900;letter-spacing:-0.5px;color:#0A0F1F;">Shoe Glitch</div>
        <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#1E90FF;margin-top:4px;">built for the culture</div>
      </div>

      <div style="background:#FFFFFF;border-radius:16px;padding:32px;border:1px solid #E5E7EB;">
        <div style="display:inline-block;padding:4px 10px;background:#1E90FF;color:#FFFFFF;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;border-radius:999px;margin-bottom:20px;">Payment received</div>
        <h1 style="font-size:28px;line-height:1.2;margin:0 0 8px 0;">Thanks, ${escapeHtml(customer.name.split(' ')[0])}.</h1>
        <p style="font-size:16px;color:#4B5563;margin:0 0 24px 0;">Your order is confirmed. We'll send status updates as it moves through our process.</p>

        <table style="width:100%;border-collapse:collapse;margin:0 0 24px 0;">
          <tr>
            <td style="padding:12px 0;border-top:1px solid #E5E7EB;color:#6B7280;font-size:13px;">Order code</td>
            <td style="padding:12px 0;border-top:1px solid #E5E7EB;text-align:right;font-family:'SF Mono',Menlo,monospace;font-weight:600;">${escapeHtml(order.code)}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-top:1px solid #E5E7EB;color:#6B7280;font-size:13px;">Pairs</td>
            <td style="padding:12px 0;border-top:1px solid #E5E7EB;text-align:right;">${order.pairCount}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-top:1px solid #E5E7EB;color:#6B7280;font-size:13px;">Fulfillment</td>
            <td style="padding:12px 0;border-top:1px solid #E5E7EB;text-align:right;text-transform:capitalize;">${escapeHtml(order.fulfillmentMethod.replace(/_/g, ' '))}</td>
          </tr>
          ${pickupWindow ? `
          <tr>
            <td style="padding:12px 0;border-top:1px solid #E5E7EB;color:#6B7280;font-size:13px;">Pickup window</td>
            <td style="padding:12px 0;border-top:1px solid #E5E7EB;text-align:right;">${escapeHtml(pickupWindow)}</td>
          </tr>` : ''}
          ${city ? `
          <tr>
            <td style="padding:12px 0;border-top:1px solid #E5E7EB;color:#6B7280;font-size:13px;">City</td>
            <td style="padding:12px 0;border-top:1px solid #E5E7EB;text-align:right;">${escapeHtml(city.name)}</td>
          </tr>` : ''}
        </table>

        <div style="background:#F4F7FB;border-radius:12px;padding:20px;margin:0 0 24px 0;">
          <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#6B7280;margin-bottom:12px;">What you ordered</div>
          <table style="width:100%;border-collapse:collapse;">
            ${primary ? `
            <tr>
              <td style="padding:6px 0;font-weight:600;">${escapeHtml(primary.serviceName)}</td>
              <td style="padding:6px 0;text-align:right;font-weight:600;">$${primary.unitPrice}</td>
            </tr>` : ''}
            ${addOnRows}
            <tr>
              <td style="padding:12px 0 0 0;border-top:1px solid #E5E7EB;font-weight:700;">Total</td>
              <td style="padding:12px 0 0 0;border-top:1px solid #E5E7EB;text-align:right;font-weight:700;font-size:18px;">$${order.total}</td>
            </tr>
          </table>
        </div>

        <a href="${SITE_URL}/customer/orders/${order.id}" style="display:block;text-align:center;background:#1E90FF;color:#FFFFFF;text-decoration:none;font-weight:600;padding:14px 24px;border-radius:12px;margin-bottom:20px;">View order details →</a>

        <p style="font-size:13px;color:#6B7280;line-height:1.5;margin:0;">
          Questions? Reply to this email or reach us at <a href="mailto:shoeglitch@gmail.com" style="color:#1E90FF;">shoeglitch@gmail.com</a>.
        </p>
      </div>

      <div style="text-align:center;padding:24px 0;color:#9CA3AF;font-size:11px;">
        © ${new Date().getFullYear()} Shoe Glitch LLC · Milwaukee, WI<br>
        <a href="${SITE_URL}/terms" style="color:#9CA3AF;">Terms</a> ·
        <a href="${SITE_URL}/privacy" style="color:#9CA3AF;">Privacy</a> ·
        <a href="${SITE_URL}/refund-policy" style="color:#9CA3AF;">Refund &amp; Damage</a>
      </div>
    </div>
  </body>
</html>`;
}

function renderOrderConfirmationText(args: {
  order: Order;
  customer: Customer;
  city: City | null;
  primary: { serviceName: string; unitPrice: number } | undefined;
  addOns: Array<{ serviceName: string; unitPrice: number }>;
}): string {
  const { order, customer, city, primary, addOns } = args;
  const pickupWindow = pickupWindowLabel(extractPickupWindowFromNotes(order.notes));
  const lines: string[] = [];
  lines.push(`Thanks, ${customer.name.split(' ')[0]} — your Shoe Glitch order is confirmed.`);
  lines.push('');
  lines.push(`Order code: ${order.code}`);
  lines.push(`Pairs: ${order.pairCount}`);
  lines.push(`Fulfillment: ${order.fulfillmentMethod.replace(/_/g, ' ')}`);
  if (pickupWindow) lines.push(`Pickup window: ${pickupWindow}`);
  if (city) lines.push(`City: ${city.name}`);
  lines.push('');
  lines.push('What you ordered:');
  if (primary) lines.push(`  ${primary.serviceName} — $${primary.unitPrice}`);
  for (const a of addOns) lines.push(`  + ${a.serviceName} — $${a.unitPrice}`);
  lines.push(`  Total: $${order.total}`);
  lines.push('');
  lines.push(`View order: ${SITE_URL}/customer/orders/${order.id}`);
  lines.push('');
  lines.push('Questions? Reply to this email or shoeglitch@gmail.com');
  lines.push('');
  lines.push('— Shoe Glitch');
  return lines.join('\n');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===========================================================================
// Status update email — fires when order status changes meaningfully
// (scheduled_pickup, picked_up, in_progress, ready_for_return, out_for_return)
// ===========================================================================

const STATUS_FRIENDLY: Record<string, { title: string; blurb: string }> = {
  pickup_assigned: { title: 'Pickup assigned', blurb: 'An operator has your pickup on deck.' },
  picked_up: { title: 'Picked up', blurb: 'We have your shoes and the service flow has started.' },
  received_at_hub: { title: 'Received at our hub', blurb: 'Your pair arrived safely and is queued for care.' },
  in_cleaning: { title: 'In cleaning', blurb: 'Your shoes are in the cleaning stage now.' },
  in_restoration: { title: 'In restoration', blurb: 'We are handling repair and detail work on your pair.' },
  quality_check: { title: 'In quality check', blurb: 'The final finish is being checked before return.' },
  ready_for_return: { title: 'Ready for return', blurb: 'Your pair is done and we are lining up the return.' },
  ready_for_pickup: { title: 'Ready for pickup', blurb: 'Your order is finished and ready to be picked up.' },
  out_for_delivery: { title: 'On the way back', blurb: 'Your operator is out for delivery with your pair.' },
  shipped_back: { title: 'Shipped back', blurb: 'Your finished pair is on the way back to you.' },
  delivered: { title: 'Delivered', blurb: 'Your order has been delivered.' },
  issue_flagged: { title: 'Issue flagged', blurb: 'Our team flagged an issue and will follow up with the next step.' },
};

export async function sendStatusUpdate(params: {
  order: Order;
  customer: Customer;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const { order, customer } = params;
  const friendly = STATUS_FRIENDLY[order.status];
  if (!friendly) return; // silent: statuses we don't email on (e.g. booked, cancelled, completed)

  const subject = `${friendly.title} — ${order.code}`;
  const html = renderStatusHtml({ order, customer, friendly });
  const text = `${friendly.title} — order ${order.code}\n\n${friendly.blurb}\n\nView order: ${SITE_URL}/customer/orders/${order.id}\n\n— Shoe Glitch`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: customer.email,
      replyTo: REPLY_TO,
      subject,
      html,
      text,
    });
    if (error) {
      console.error('[email] resend error on sendStatusUpdate:', error);
    } else {
      console.log(`[email] sent status=${order.status} to ${customer.email} for ${order.code}`);
    }
  } catch (err: any) {
    console.error('[email] exception in sendStatusUpdate:', err?.message ?? err);
  }
}

// ===========================================================================
// Completion email — fires when order status becomes 'completed'
// ===========================================================================

export async function sendOrderCompleted(params: {
  order: Order;
  customer: Customer;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const { order, customer } = params;
  const subject = `Your shoes are back — ${order.code}`;
  const html = renderCompletedHtml({ order, customer });
  const text = `Your shoes are ready, ${customer.name.split(' ')[0]}.\n\nOrder ${order.code} is complete. We hope they look fresh.\n\nIf anything is off, reply to this email within 7 days.\n\nView order: ${SITE_URL}/customer/orders/${order.id}\n\n— Shoe Glitch`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: customer.email,
      replyTo: REPLY_TO,
      subject,
      html,
      text,
    });
    if (error) {
      console.error('[email] resend error on sendOrderCompleted:', error);
    } else {
      console.log(`[email] sent completion to ${customer.email} for ${order.code}`);
    }
  } catch (err: any) {
    console.error('[email] exception in sendOrderCompleted:', err?.message ?? err);
  }
}

// ===========================================================================
// Refund email — fires when Stripe webhook reports a refund
// ===========================================================================

export async function sendRefundConfirmation(params: {
  order: Order;
  customer: Customer;
  refundAmount: number; // dollars
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const { order, customer, refundAmount } = params;
  const subject = `Refund processed — ${order.code}`;
  const html = renderRefundHtml({ order, customer, refundAmount });
  const text = `${customer.name.split(' ')[0]}, we've processed a refund of $${refundAmount} for order ${order.code}.\n\nIt should appear on your statement within 5-10 business days.\n\nQuestions? Reply to this email.\n\n— Shoe Glitch`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: customer.email,
      replyTo: REPLY_TO,
      subject,
      html,
      text,
    });
    if (error) {
      console.error('[email] resend error on sendRefundConfirmation:', error);
    } else {
      console.log(`[email] sent refund to ${customer.email} for ${order.code}`);
    }
  } catch (err: any) {
    console.error('[email] exception in sendRefundConfirmation:', err?.message ?? err);
  }
}

export async function sendCustomerWelcomeEmail(params: {
  toEmail: string;
  name: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const firstName = params.name.split(' ')[0] || 'there';

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.toEmail,
      replyTo: REPLY_TO,
      subject: 'Welcome to Shoe Glitch',
      html: simpleShell({
        badge: 'Welcome',
        heading: `You’re in, ${escapeHtml(firstName)}.`,
        body: `
          <p style="font-size:16px;color:#4B5563;margin:0 0 16px 0;">Your Shoe Glitch account is ready. You can book a clean, track orders, and save pairs to your sneaker watchlist from one place.</p>
          <div style="font-size:14px;line-height:1.7;color:#4B5563;">
            <strong>What to do next</strong><br>
            Book your first clean, upload intake photos, or start a watchlist if you want release and price alerts tied to pairs you care about.
          </div>
        `,
        cta: { href: `${SITE_URL}/customer`, label: 'Open my dashboard →' },
      }),
      text: [
        `Welcome to Shoe Glitch, ${firstName}.`,
        '',
        'Your account is ready. You can now book a clean, track orders, and save sneakers to your watchlist.',
        '',
        `Dashboard: ${SITE_URL}/customer`,
        '',
        '— Shoe Glitch',
      ].join('\n'),
    });
    if (error) {
      console.error('[email] resend error on sendCustomerWelcomeEmail:', error);
    }
  } catch (err: any) {
    console.error('[email] exception in sendCustomerWelcomeEmail:', err?.message ?? err);
  }
}

export async function sendAbandonedBookingFollowUp(params: {
  toEmail: string;
  name: string;
  orderCode: string;
  orderId: string;
  serviceName?: string | null;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const firstName = params.name.split(' ')[0] || 'there';

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.toEmail,
      replyTo: REPLY_TO,
      subject: `Still want to book your clean? — ${params.orderCode}`,
      html: simpleShell({
        badge: 'Booking reminder',
        heading: `Your booking wasn’t finished, ${escapeHtml(firstName)}.`,
        body: `
          <p style="font-size:16px;color:#4B5563;margin:0 0 16px 0;">We saved the start of your Shoe Glitch booking for <strong>${escapeHtml(params.orderCode)}</strong>, but checkout expired before payment went through.</p>
          <div style="font-size:14px;line-height:1.7;color:#4B5563;">
            ${params.serviceName ? `<strong>Service</strong><br>${escapeHtml(params.serviceName)}<br><br>` : ''}
            If you still want us to handle the pair, come back in and finish the booking.
          </div>
        `,
        cta: { href: `${SITE_URL}/book`, label: 'Return to booking →' },
      }),
      text: [
        `Your booking for ${params.orderCode} was not completed.`,
        '',
        params.serviceName ? `Service: ${params.serviceName}` : null,
        `Resume here: ${SITE_URL}/book`,
        '',
        '— Shoe Glitch',
      ].filter(Boolean).join('\n'),
    });
    if (error) {
      console.error('[email] resend error on sendAbandonedBookingFollowUp:', error);
    }
  } catch (err: any) {
    console.error('[email] exception in sendAbandonedBookingFollowUp:', err?.message ?? err);
  }
}

export async function sendOperatorBookingAlert(params: {
  order: Order;
  city: City | null;
  cleaners: Cleaner[];
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const { order, city, cleaners } = params;
  const recipients = cleaners.map((cleaner) => cleaner.email).filter(Boolean);
  if (recipients.length === 0) return;

  const pickupWindow = pickupWindowLabel(extractPickupWindowFromNotes(order.notes));
  const primary = order.items.find((item) => !item.isAddOn);
  const subject = `New ${order.fulfillmentMethod} booking — ${order.code}`;
  const detailRows = [
    `Order code: ${order.code}`,
    `City: ${city?.name ?? 'Shoe Glitch'}`,
    `Service: ${primary?.serviceName ?? 'Order booked'}`,
    `Pairs: ${order.pairCount}`,
    `Fulfillment: ${order.fulfillmentMethod}`,
    pickupWindow ? `Pickup window: ${pickupWindow}` : null,
  ]
    .filter(Boolean)
    .join('<br>');

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: recipients,
      replyTo: REPLY_TO,
      subject,
      html: simpleShell({
        badge: 'New booking',
        heading: `New ${order.fulfillmentMethod} order in ${city?.name ?? 'your city'}.`,
        body: `<p style="font-size:16px;color:#4B5563;margin:0 0 20px 0;">A customer just booked a new service. Jump into the operator dashboard to claim or review it.</p>
          <div style="font-size:14px;line-height:1.7;color:#4B5563;">${detailRows}</div>`,
        cta: { href: `${SITE_URL}/cleaner`, label: 'Open operator dashboard →' },
      }),
      text: [
        `New ${order.fulfillmentMethod} order in ${city?.name ?? 'your city'}.`,
        '',
        `Order code: ${order.code}`,
        `Service: ${primary?.serviceName ?? 'Order booked'}`,
        `Pairs: ${order.pairCount}`,
        pickupWindow ? `Pickup window: ${pickupWindow}` : null,
        '',
        `Open dashboard: ${SITE_URL}/cleaner`,
        '',
        '— Shoe Glitch',
      ]
        .filter(Boolean)
        .join('\n'),
    });
    if (error) {
      console.error('[email] resend error on sendOperatorBookingAlert:', error);
    } else {
      console.log(`[email] sent operator booking alert for ${order.code} to ${recipients.length} operators`);
    }
  } catch (err: any) {
    console.error('[email] exception in sendOperatorBookingAlert:', err?.message ?? err);
  }
}

export async function sendOperatorOnTheWay(params: {
  order: Order;
  customer: Customer;
  operatorName: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const { order, customer, operatorName } = params;
  const pickupWindow = pickupWindowLabel(extractPickupWindowFromNotes(order.notes));
  const subject = `Your Shoe Glitch operator is on the way — ${order.code}`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: customer.email,
      replyTo: REPLY_TO,
      subject,
      html: simpleShell({
        badge: 'Operator en route',
        heading: `${escapeHtml(operatorName)} is on the way.`,
        body: `<p style="font-size:16px;color:#4B5563;margin:0 0 16px 0;">Your Shoe Glitch operator is heading out now for order <strong>${escapeHtml(order.code)}</strong>.</p>
          ${pickupWindow ? `<p style="font-size:14px;color:#6B7280;margin:0;">Requested pickup window: <strong>${escapeHtml(pickupWindow)}</strong></p>` : ''}`,
        cta: { href: `${SITE_URL}/customer/orders/${order.id}`, label: 'Track order →' },
      }),
      text: [
        `${operatorName} is on the way for your Shoe Glitch pickup.`,
        '',
        `Order code: ${order.code}`,
        pickupWindow ? `Requested pickup window: ${pickupWindow}` : null,
        `Track order: ${SITE_URL}/customer/orders/${order.id}`,
        '',
        '— Shoe Glitch',
      ]
        .filter(Boolean)
        .join('\n'),
    });
    if (error) {
      console.error('[email] resend error on sendOperatorOnTheWay:', error);
    } else {
      console.log(`[email] sent on-the-way email to ${customer.email} for ${order.code}`);
    }
  } catch (err: any) {
    console.error('[email] exception in sendOperatorOnTheWay:', err?.message ?? err);
  }
}

export async function sendSneakerWatchlistAlert(params: {
  toEmail: string;
  customerName: string;
  sneakerName: string;
  brand: string;
  imageUrl?: string;
  eventType: 'release' | 'restock' | 'price_drop';
  eventDate: string;
  price?: number;
  ctaUrl: string;
  watchLabel: string;
}): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const {
    toEmail,
    customerName,
    sneakerName,
    brand,
    imageUrl,
    eventType,
    eventDate,
    price,
    ctaUrl,
    watchLabel,
  } = params;

  const eventLabel =
    eventType === 'release' ? 'Release alert' : eventType === 'restock' ? 'Restock alert' : 'Price drop alert';
  const subject = `${eventLabel} — ${sneakerName}`;
  const formattedDate = new Date(eventDate).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: toEmail,
      replyTo: REPLY_TO,
      subject,
      html: simpleShell({
        badge: eventLabel,
        heading: `${escapeHtml(sneakerName)} is live on your watchlist.`,
        body: `
          ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(sneakerName)}" style="display:block;width:100%;max-width:440px;border-radius:16px;margin:0 0 20px 0;object-fit:cover;" />` : ''}
          <p style="font-size:16px;color:#4B5563;margin:0 0 16px 0;">Hi ${escapeHtml(customerName.split(' ')[0])}, we detected a ${escapeHtml(eventType.replace('_', ' '))} event for <strong>${escapeHtml(sneakerName)}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Brand</td><td style="padding:8px 0;text-align:right;">${escapeHtml(brand)}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Watch</td><td style="padding:8px 0;text-align:right;">${escapeHtml(watchLabel)}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Event date</td><td style="padding:8px 0;text-align:right;">${escapeHtml(formattedDate)}</td></tr>
            ${price ? `<tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Price</td><td style="padding:8px 0;text-align:right;">$${price}</td></tr>` : ''}
          </table>
        `,
        cta: { href: ctaUrl, label: 'Open sneaker page →' },
      }),
      text: [
        `${eventLabel}: ${sneakerName}`,
        '',
        `Brand: ${brand}`,
        `Watch: ${watchLabel}`,
        `Event date: ${formattedDate}`,
        price ? `Price: $${price}` : null,
        `Open: ${ctaUrl}`,
        '',
        '— Shoe Glitch',
      ]
        .filter(Boolean)
        .join('\n'),
    });
    if (error) {
      console.error('[email] resend error on sendSneakerWatchlistAlert:', error);
      throw new Error(error.message);
    }
    return true;
  } catch (err: any) {
    console.error('[email] exception in sendSneakerWatchlistAlert:', err?.message ?? err);
    throw err instanceof Error ? err : new Error('Watchlist alert failed.');
  }
}

export async function sendSneakerDigestEmail(params: {
  toEmail: string;
  customerName: string;
  items: Array<{
    sneakerName: string;
    eventType: 'release' | 'restock' | 'price_drop';
    eventDate: string;
    price?: number | null;
    ctaUrl: string;
  }>;
}): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;
  if (params.items.length === 0) return false;

  const firstName = params.customerName.split(' ')[0] || 'there';
  const rows = params.items
    .map((item) => {
      const label =
        item.eventType === 'release' ? 'Release' : item.eventType === 'restock' ? 'Restock' : 'Price drop';
      const formattedDate = new Date(item.eventDate).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      return `
        <tr>
          <td style="padding:10px 0;color:#0A0F1F;font-weight:600;">${escapeHtml(item.sneakerName)}</td>
          <td style="padding:10px 0;text-align:right;color:#4B5563;">${escapeHtml(label)}</td>
          <td style="padding:10px 0;text-align:right;color:#4B5563;">${escapeHtml(formattedDate)}</td>
          <td style="padding:10px 0;text-align:right;color:#4B5563;">${item.price ? `$${item.price}` : 'Watch now'}</td>
        </tr>
      `;
    })
    .join('');

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.toEmail,
      replyTo: REPLY_TO,
      subject: `Your Sneaker Watchlist Digest — ${params.items.length} updates`,
      html: simpleShell({
        badge: 'Watchlist digest',
        heading: `${escapeHtml(firstName)}, here’s what moved on your list.`,
        body: `
          <p style="font-size:16px;color:#4B5563;margin:0 0 16px 0;">We pulled together the newest release, restock, and price-drop signals we found for pairs you’re watching.</p>
          <table style="width:100%;border-collapse:collapse;">
            ${rows}
          </table>
        `,
        cta: { href: `${SITE_URL}/customer/watchlist`, label: 'Open my watchlist →' },
      }),
      text: [
        `Sneaker Watchlist Digest for ${firstName}`,
        '',
        ...params.items.map((item) => {
          const label =
            item.eventType === 'release' ? 'Release' : item.eventType === 'restock' ? 'Restock' : 'Price drop';
          return `${item.sneakerName} — ${label}${item.price ? ` — $${item.price}` : ''}`;
        }),
        '',
        `Watchlist: ${SITE_URL}/customer/watchlist`,
        '',
        '— Shoe Glitch',
      ].join('\n'),
    });
    if (error) {
      console.error('[email] resend error on sendSneakerDigestEmail:', error);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('[email] exception in sendSneakerDigestEmail:', err?.message ?? err);
    return false;
  }
}

export async function sendOperatorApplicationAdminAlert(params: {
  applicationId: string;
  name: string;
  email: string;
  phone: string;
  cityName: string;
  tier: 'starter' | 'pro' | 'luxury';
  experience?: string | null;
  whyJoin?: string | null;
  licenseUploaded?: boolean;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const recipients = getAdminAlertRecipients();
  if (recipients.length === 0) return;

  const { applicationId, name, email, phone, cityName, tier, experience, whyJoin, licenseUploaded } = params;
  const tierName = getOperatorTierDefinition(tier).name;
  const subject = `New operator application — ${name} · ${cityName}`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: recipients,
      replyTo: email,
      subject,
      html: simpleShell({
        badge: 'New operator lead',
        heading: `${escapeHtml(name)} just applied in ${escapeHtml(cityName)}.`,
        body: `
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Application</td><td style="padding:8px 0;text-align:right;font-family:'SF Mono',Menlo,monospace;font-weight:600;">${escapeHtml(applicationId)}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Email</td><td style="padding:8px 0;text-align:right;">${escapeHtml(email)}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Phone</td><td style="padding:8px 0;text-align:right;">${escapeHtml(phone)}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">City</td><td style="padding:8px 0;text-align:right;">${escapeHtml(cityName)}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Kit tier</td><td style="padding:8px 0;text-align:right;">${escapeHtml(tierName)}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Driver license</td><td style="padding:8px 0;text-align:right;">${licenseUploaded ? 'Uploaded' : 'Missing'}</td></tr>
          </table>
          ${experience ? `<p style="font-size:14px;color:#4B5563;margin:20px 0 12px 0;"><strong>Experience</strong><br>${escapeHtml(experience)}</p>` : ''}
          ${whyJoin ? `<p style="font-size:14px;color:#4B5563;margin:12px 0 0 0;"><strong>Why Shoe Glitch</strong><br>${escapeHtml(whyJoin)}</p>` : ''}
        `,
        cta: { href: `${SITE_URL}/admin/operators`, label: 'Review applications →' },
      }),
      text: [
        `New operator application from ${name}`,
        '',
        `Application: ${applicationId}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `City: ${cityName}`,
        `Kit tier: ${tierName}`,
        `Driver license: ${licenseUploaded ? 'Uploaded' : 'Missing'}`,
        experience ? `Experience: ${experience}` : null,
        whyJoin ? `Why Shoe Glitch: ${whyJoin}` : null,
        '',
        `Review: ${SITE_URL}/admin/operators`,
        '',
        '— Shoe Glitch',
      ]
        .filter(Boolean)
        .join('\n'),
    });
    if (error) {
      console.error('[email] resend error on sendOperatorApplicationAdminAlert:', error);
    }
  } catch (err: any) {
    console.error('[email] exception in sendOperatorApplicationAdminAlert:', err?.message ?? err);
  }
}

export async function sendOperatorApplicationConfirmation(params: {
  applicationId: string;
  toEmail: string;
  name: string;
  cityName: string;
  tier: 'starter' | 'pro' | 'luxury';
  licenseUploaded?: boolean;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const { applicationId, toEmail, name, cityName, tier, licenseUploaded } = params;
  const tierName = getOperatorTierDefinition(tier).name;
  const subject = `Application received — Shoe Glitch operator path`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: toEmail,
      replyTo: REPLY_TO,
      subject,
      html: simpleShell({
        badge: 'Application received',
        heading: `We received your operator application, ${escapeHtml(name.split(' ')[0])}.`,
        body: `
          <p style="font-size:16px;color:#4B5563;margin:0 0 16px 0;">Your Shoe Glitch operator application is in for <strong>${escapeHtml(cityName)}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Application</td><td style="padding:8px 0;text-align:right;font-family:'SF Mono',Menlo,monospace;font-weight:600;">${escapeHtml(applicationId)}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Kit tier</td><td style="padding:8px 0;text-align:right;">${escapeHtml(tierName)}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Driver license</td><td style="padding:8px 0;text-align:right;">${licenseUploaded ? 'Received' : 'Needed'}</td></tr>
          </table>
          <p style="font-size:14px;color:#6B7280;margin:20px 0 0 0;">Our team will review your application packet, kit payment, and license upload before sending the next step. Keep an eye on your inbox for updates.</p>
        `,
        cta: { href: `${SITE_URL}/operator/applied?ref=${encodeURIComponent(applicationId)}`, label: 'View application status →' },
      }),
      text: [
        `We received your Shoe Glitch operator application.`,
        '',
        `Application: ${applicationId}`,
        `City: ${cityName}`,
        `Kit tier: ${tierName}`,
        `Driver license: ${licenseUploaded ? 'Received' : 'Needed'}`,
        '',
        `Status page: ${SITE_URL}/operator/applied?ref=${encodeURIComponent(applicationId)}`,
        '',
        '— Shoe Glitch',
      ].join('\n'),
    });
    if (error) {
      console.error('[email] resend error on sendOperatorApplicationConfirmation:', error);
    }
  } catch (err: any) {
    console.error('[email] exception in sendOperatorApplicationConfirmation:', err?.message ?? err);
  }
}

export async function sendOperatorKitPaymentConfirmation(params: {
  applicationId: string;
  toEmail: string;
  name: string;
  cityName: string;
  tier: 'starter' | 'pro' | 'luxury';
  amount: number;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const { applicationId, toEmail, name, cityName, tier, amount } = params;
  const tierName = getOperatorTierDefinition(tier).name;
  const subject = `Kit payment received — Shoe Glitch operator application`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: toEmail,
      replyTo: REPLY_TO,
      subject,
      html: simpleShell({
        badge: 'Kit payment received',
        heading: `Your operator kit payment is in, ${escapeHtml(name.split(' ')[0])}.`,
        body: `
          <p style="font-size:16px;color:#4B5563;margin:0 0 16px 0;">We received your <strong>$${amount}</strong> kit payment for the <strong>${escapeHtml(tierName)}</strong> tier in <strong>${escapeHtml(cityName)}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Application</td><td style="padding:8px 0;text-align:right;font-family:'SF Mono',Menlo,monospace;font-weight:600;">${escapeHtml(applicationId)}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Status</td><td style="padding:8px 0;text-align:right;">Pending review</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Kit tier</td><td style="padding:8px 0;text-align:right;">${escapeHtml(tierName)}</td></tr>
          </table>
          <p style="font-size:14px;color:#6B7280;margin:20px 0 0 0;">Next, our team reviews your application and follows up with the approval decision and onboarding details.</p>
        `,
        cta: { href: `${SITE_URL}/operator/applied?ref=${encodeURIComponent(applicationId)}&paid=1`, label: 'View application status →' },
      }),
      text: [
        `We received your Shoe Glitch operator kit payment.`,
        '',
        `Application: ${applicationId}`,
        `City: ${cityName}`,
        `Kit tier: ${tierName}`,
        `Amount: $${amount}`,
        `Status: Pending review`,
        '',
        `Status page: ${SITE_URL}/operator/applied?ref=${encodeURIComponent(applicationId)}&paid=1`,
        '',
        '— Shoe Glitch',
      ].join('\n'),
    });
    if (error) {
      console.error('[email] resend error on sendOperatorKitPaymentConfirmation:', error);
    }
  } catch (err: any) {
    console.error('[email] exception in sendOperatorKitPaymentConfirmation:', err?.message ?? err);
  }
}

export async function sendOperatorApplicationApproved(params: {
  applicationId: string;
  toEmail: string;
  name: string;
  cityName: string;
  tier: 'starter' | 'pro' | 'luxury';
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const { applicationId, toEmail, name, cityName, tier } = params;
  const tierName = getOperatorTierDefinition(tier).name;
  const subject = `Application approved — Shoe Glitch operator path`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: toEmail,
      replyTo: REPLY_TO,
      subject,
      html: simpleShell({
        badge: 'Application approved',
        heading: `You’re approved for the next step, ${escapeHtml(name.split(' ')[0])}.`,
        body: `
          <p style="font-size:16px;color:#4B5563;margin:0 0 16px 0;">Your Shoe Glitch operator application for <strong>${escapeHtml(cityName)}</strong> has been approved.</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Application</td><td style="padding:8px 0;text-align:right;font-family:'SF Mono',Menlo,monospace;font-weight:600;">${escapeHtml(applicationId)}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Kit tier</td><td style="padding:8px 0;text-align:right;">${escapeHtml(tierName)}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Status</td><td style="padding:8px 0;text-align:right;">Approved</td></tr>
          </table>
          <p style="font-size:14px;color:#6B7280;margin:20px 0 0 0;">Watch your inbox for your Shoe Glitch sign-in invite plus the onboarding, training, and territory activation details. If you already paid your kit fee, no further payment action is needed right now.</p>
        `,
        cta: { href: `${SITE_URL}/operator/applied?ref=${encodeURIComponent(applicationId)}&status=approved`, label: 'Review next steps →' },
      }),
      text: [
        `Your Shoe Glitch operator application has been approved.`,
        '',
        `Application: ${applicationId}`,
        `City: ${cityName}`,
        `Kit tier: ${tierName}`,
        `Status: Approved`,
        '',
        'Watch your inbox for your Shoe Glitch sign-in invite and next-step onboarding details.',
        `Status page: ${SITE_URL}/operator/applied?ref=${encodeURIComponent(applicationId)}&status=approved`,
        '',
        '— Shoe Glitch',
      ].join('\n'),
    });
    if (error) {
      console.error('[email] resend error on sendOperatorApplicationApproved:', error);
    }
  } catch (err: any) {
    console.error('[email] exception in sendOperatorApplicationApproved:', err?.message ?? err);
  }
}

export async function sendOperatorApplicationRejected(params: {
  applicationId: string;
  toEmail: string;
  name: string;
  cityName: string;
  tier: 'starter' | 'pro' | 'luxury';
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const { applicationId, toEmail, name, cityName, tier } = params;
  const tierName = getOperatorTierDefinition(tier).name;
  const subject = `Application update — Shoe Glitch operator path`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: toEmail,
      replyTo: REPLY_TO,
      subject,
      html: simpleShell({
        badge: 'Application update',
        heading: `We reviewed your application, ${escapeHtml(name.split(' ')[0])}.`,
        body: `
          <p style="font-size:16px;color:#4B5563;margin:0 0 16px 0;">Thanks again for applying to operate with Shoe Glitch in <strong>${escapeHtml(cityName)}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Application</td><td style="padding:8px 0;text-align:right;font-family:'SF Mono',Menlo,monospace;font-weight:600;">${escapeHtml(applicationId)}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Kit tier</td><td style="padding:8px 0;text-align:right;">${escapeHtml(tierName)}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Status</td><td style="padding:8px 0;text-align:right;">Not moving forward right now</td></tr>
          </table>
          <p style="font-size:14px;color:#6B7280;margin:20px 0 0 0;">We are not moving forward with this application at the moment. If your city opens more capacity or the fit changes, our team may reach back out.</p>
        `,
        cta: { href: `${SITE_URL}/become-an-operator`, label: 'Review operator opportunities →' },
      }),
      text: [
        `We reviewed your Shoe Glitch operator application.`,
        '',
        `Application: ${applicationId}`,
        `City: ${cityName}`,
        `Kit tier: ${tierName}`,
        `Status: Not moving forward right now`,
        '',
        'We are not moving forward with this application at the moment, but we may reach back out if capacity or fit changes.',
        `Operator opportunities: ${SITE_URL}/become-an-operator`,
        '',
        '— Shoe Glitch',
      ].join('\n'),
    });
    if (error) {
      console.error('[email] resend error on sendOperatorApplicationRejected:', error);
    }
  } catch (err: any) {
    console.error('[email] exception in sendOperatorApplicationRejected:', err?.message ?? err);
  }
}

// ---------------------------------------------------------------------------
// Simple wrapper template used by status, completion, refund emails
// ---------------------------------------------------------------------------

function simpleShell(args: { badge: string; heading: string; body: string; cta?: { href: string; label: string } }): string {
  const { badge, heading, body, cta } = args;
  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><title>${escapeHtml(heading)}</title></head>
  <body style="margin:0;padding:0;background:#F4F7FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0A0F1F;">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <div style="text-align:center;padding:24px 0;">
        <div style="font-size:28px;font-weight:900;letter-spacing:-0.5px;color:#0A0F1F;">Shoe Glitch</div>
        <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#1E90FF;margin-top:4px;">built for the culture</div>
      </div>
      <div style="background:#FFFFFF;border-radius:16px;padding:32px;border:1px solid #E5E7EB;">
        <div style="display:inline-block;padding:4px 10px;background:#1E90FF;color:#FFFFFF;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;border-radius:999px;margin-bottom:20px;">${escapeHtml(badge)}</div>
        <h1 style="font-size:28px;line-height:1.2;margin:0 0 12px 0;">${escapeHtml(heading)}</h1>
        ${body}
        ${cta ? `<a href="${cta.href}" style="display:block;text-align:center;background:#1E90FF;color:#FFFFFF;text-decoration:none;font-weight:600;padding:14px 24px;border-radius:12px;margin-top:20px;">${escapeHtml(cta.label)}</a>` : ''}
        <p style="font-size:13px;color:#6B7280;line-height:1.5;margin:24px 0 0 0;">
          Questions? Reply to this email or reach us at <a href="mailto:shoeglitch@gmail.com" style="color:#1E90FF;">shoeglitch@gmail.com</a>.
        </p>
      </div>
      <div style="text-align:center;padding:24px 0;color:#9CA3AF;font-size:11px;">
        © ${new Date().getFullYear()} Shoe Glitch LLC · Milwaukee, WI<br>
        <a href="${SITE_URL}/terms" style="color:#9CA3AF;">Terms</a> ·
        <a href="${SITE_URL}/privacy" style="color:#9CA3AF;">Privacy</a> ·
        <a href="${SITE_URL}/refund-policy" style="color:#9CA3AF;">Refund &amp; Damage</a>
      </div>
    </div>
  </body>
</html>`;
}

function renderStatusHtml(args: { order: Order; customer: Customer; friendly: { title: string; blurb: string } }): string {
  const { order, customer, friendly } = args;
  return simpleShell({
    badge: 'Status update',
    heading: `${friendly.title}, ${escapeHtml(customer.name.split(' ')[0])}.`,
    body: `<p style="font-size:16px;color:#4B5563;margin:0 0 20px 0;">${escapeHtml(friendly.blurb)}</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Order code</td><td style="padding:8px 0;text-align:right;font-family:'SF Mono',Menlo,monospace;font-weight:600;">${escapeHtml(order.code)}</td></tr>
      </table>`,
    cta: { href: `${SITE_URL}/customer/orders/${order.id}`, label: 'View order →' },
  });
}

function renderCompletedHtml(args: { order: Order; customer: Customer }): string {
  const { order, customer } = args;
  return simpleShell({
    badge: 'Service complete',
    heading: `Your shoes are back, ${escapeHtml(customer.name.split(' ')[0])}.`,
    body: `<p style="font-size:16px;color:#4B5563;margin:0 0 20px 0;">Order <strong>${escapeHtml(order.code)}</strong> is complete. We hope they look fresh.</p>
      <p style="font-size:14px;color:#6B7280;margin:0 0 16px 0;">If anything is off, reply to this email within <strong>7 days</strong> and we'll make it right.</p>`,
    cta: { href: `${SITE_URL}/customer/orders/${order.id}`, label: 'View order details →' },
  });
}

function renderRefundHtml(args: { order: Order; customer: Customer; refundAmount: number }): string {
  const { order, customer, refundAmount } = args;
  return simpleShell({
    badge: 'Refund processed',
    heading: `Refund processed for ${escapeHtml(customer.name.split(' ')[0])}.`,
    body: `<p style="font-size:16px;color:#4B5563;margin:0 0 20px 0;">We've processed a refund of <strong>$${refundAmount}</strong> for order <strong>${escapeHtml(order.code)}</strong>.</p>
      <p style="font-size:14px;color:#6B7280;margin:0 0 16px 0;">The refund should appear on your statement within <strong>5-10 business days</strong>, depending on your bank.</p>`,
  });
}
