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
import type { Order, Customer, City, Cleaner } from '@/types';

const FROM = 'Shoe Glitch <contact@shoeglitch.com>';
const REPLY_TO = 'contact@shoeglitch.com';
const SITE_URL = 'https://shoeglitch.com';

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
