import type { Address, City, Customer, Order } from '@/types';

const SHIPPO_API_BASE = 'https://api.goshippo.com';

type ShippoParcelTemplate = {
  length: number;
  width: number;
  height: number;
  weight: number;
  referenceBox: string;
};

type ShippoRate = {
  object_id: string;
  amount?: string;
  currency?: string;
  provider?: string;
  servicelevel?: {
    name?: string;
    token?: string;
  };
  estimated_days?: number;
};

type ShippoShipment = {
  object_id: string;
  rates?: ShippoRate[];
  messages?: Array<{ code?: string; text?: string }>;
};

type ShippoTransaction = {
  object_id: string;
  status?: string;
  label_url?: string;
  tracking_number?: string;
  tracking_url_provider?: string;
  messages?: Array<{ code?: string; text?: string }>;
  rate?: ShippoRate;
};

export type MailInLabelResult = {
  labelUrl: string;
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  serviceLevel?: string;
  shipmentId: string;
  transactionId: string;
  labelCreatedAt: string;
  labelCost?: number;
  labelCurrency?: string;
  parcelTemplate: ShippoParcelTemplate;
  hubAddress: Address;
};

export function isShippoConfigured() {
  return Boolean(process.env.SHIPPO_API_KEY?.trim());
}

export function estimateMailInParcel(pairCount: number): ShippoParcelTemplate {
  if (pairCount <= 1) {
    return {
      length: 16,
      width: 12,
      height: 8,
      weight: 4,
      referenceBox: '16 x 12 x 8 in box',
    };
  }

  if (pairCount === 2) {
    return {
      length: 18,
      width: 14,
      height: 10,
      weight: 7,
      referenceBox: '18 x 14 x 10 in box',
    };
  }

  return {
    length: 20,
    width: 16,
    height: 12,
    weight: Math.max(10, pairCount * 3),
    referenceBox: '20 x 16 x 12 in box',
  };
}

export function buildMailInPackingInstructions(order: Order) {
  const parcel = estimateMailInParcel(order.pairCount);

  return {
    parcel,
    bullets: [
      'Use a sturdy corrugated shipping box instead of an envelope or soft mailer.',
      `For ${order.pairCount} pair${order.pairCount === 1 ? '' : 's'}, aim for a ${parcel.referenceBox} or something close.`,
      'Wrap each pair in clean paper or put each pair in its own plastic bag so they do not rub together in transit.',
      'Do not send the original collectible shoe box unless you want it returned as part of the order.',
      'Lightly stuff the toes with packing paper so the shape holds during transit.',
      'Tape every seam, print the prepaid label, and drop the package with the carrier shown on the label.',
    ],
  };
}

export async function createMailInLabel(params: {
  order: Order;
  customer: Customer;
  city: City;
}): Promise<MailInLabelResult> {
  const apiKey = process.env.SHIPPO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('SHIPPO_API_KEY is not configured.');
  }

  const fromAddress = requireCustomerAddress(params.order.returnAddress);
  const toAddress = buildMailInHubAddress(params.city);
  const parcel = estimateMailInParcel(params.order.pairCount);

  const shipment = await shippoFetch<ShippoShipment>('/shipments/', {
    address_from: {
      name: params.customer.name,
      email: params.customer.email,
      phone: params.customer.phone,
      street1: fromAddress.line1,
      street2: fromAddress.line2 || undefined,
      city: fromAddress.city,
      state: fromAddress.state,
      zip: fromAddress.zip,
      country: 'US',
      is_residential: true,
    },
    address_to: {
      name: process.env.SHIPPO_MAILIN_HUB_NAME?.trim() || 'Shoe Glitch Mail-In',
      email: process.env.SHIPPO_MAILIN_HUB_EMAIL?.trim() || 'contact@shoeglitch.com',
      phone: process.env.SHIPPO_MAILIN_HUB_PHONE?.trim() || undefined,
      street1: toAddress.line1,
      street2: toAddress.line2 || undefined,
      city: toAddress.city,
      state: toAddress.state,
      zip: toAddress.zip,
      country: 'US',
      is_residential: false,
    },
    parcels: [
      {
        length: String(parcel.length),
        width: String(parcel.width),
        height: String(parcel.height),
        distance_unit: 'in',
        weight: String(parcel.weight),
        mass_unit: 'lb',
      },
    ],
    async: false,
  }, apiKey);

  const bestRate = chooseBestMailInRate(shipment.rates ?? []);
  if (!bestRate) {
    throw new Error(formatShippoMessages(shipment.messages) || 'Shippo returned no purchasable rates.');
  }

  const transaction = await shippoFetch<ShippoTransaction>('/transactions/', {
    rate: bestRate.object_id,
    async: false,
    label_file_type: 'PDF_4X6',
  }, apiKey);

  if (transaction.status !== 'SUCCESS' || !transaction.label_url) {
    throw new Error(formatShippoMessages(transaction.messages) || 'Shippo label purchase did not succeed.');
  }

  return {
    labelUrl: transaction.label_url,
    trackingNumber: transaction.tracking_number,
    trackingUrl: transaction.tracking_url_provider,
    carrier: transaction.rate?.provider ?? bestRate.provider,
    serviceLevel: transaction.rate?.servicelevel?.name ?? bestRate.servicelevel?.name,
    shipmentId: shipment.object_id,
    transactionId: transaction.object_id,
    labelCreatedAt: new Date().toISOString(),
    labelCost: parseMoney(transaction.rate?.amount ?? bestRate.amount),
    labelCurrency: transaction.rate?.currency ?? bestRate.currency,
    parcelTemplate: parcel,
    hubAddress: toAddress,
  };
}

async function shippoFetch<T>(path: string, body: unknown, apiKey: string): Promise<T> {
  const response = await fetch(`${SHIPPO_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `ShippoToken ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(formatShippoMessages(payload?.messages) || payload?.detail || `Shippo request failed (${response.status}).`);
  }

  return payload as T;
}

function chooseBestMailInRate(rates: ShippoRate[]) {
  const usable = rates
    .map((rate) => ({
      rate,
      amount: parseMoney(rate.amount),
      score: scoreRate(rate),
    }))
    .filter((entry) => entry.amount != null);

  usable.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return (a.amount ?? 0) - (b.amount ?? 0);
  });

  return usable[0]?.rate;
}

function scoreRate(rate: ShippoRate) {
  const provider = `${rate.provider ?? ''} ${rate.servicelevel?.name ?? ''} ${rate.servicelevel?.token ?? ''}`.toLowerCase();

  if (provider.includes('usps') && provider.includes('ground advantage')) return 100;
  if (provider.includes('ups') && provider.includes('ground')) return 95;
  if (provider.includes('fedex') && provider.includes('ground')) return 90;
  if (provider.includes('ground')) return 80;
  if (provider.includes('priority')) return 70;
  return 50;
}

function buildMailInHubAddress(city: City): Address {
  const envAddress = readHubAddressFromEnv();
  if (envAddress) return envAddress;

  const raw = city.hubAddress?.trim();
  if (!raw) {
    throw new Error(`No hub address is configured for ${city.name}.`);
  }

  const parsed = parseSingleLineUsAddress(raw);
  if (!parsed) {
    throw new Error(`Hub address for ${city.name} is not in a Shippo-friendly format.`);
  }

  return parsed;
}

function readHubAddressFromEnv(): Address | null {
  const line1 = process.env.SHIPPO_MAILIN_HUB_LINE1?.trim();
  const city = process.env.SHIPPO_MAILIN_HUB_CITY?.trim();
  const state = process.env.SHIPPO_MAILIN_HUB_STATE?.trim();
  const zip = process.env.SHIPPO_MAILIN_HUB_ZIP?.trim();

  if (!line1 || !city || !state || !zip) return null;

  return {
    line1,
    line2: process.env.SHIPPO_MAILIN_HUB_LINE2?.trim() || undefined,
    city,
    state,
    zip,
  };
}

function parseSingleLineUsAddress(value: string): Address | null {
  const match = value.match(/^(.*?)(?:,\s*(.*?))?,\s*([^,]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/i);
  if (!match) return null;

  const [, line1, line2Maybe, city, state, zip] = match;
  return {
    line1: line1.trim(),
    line2: line2Maybe?.trim() || undefined,
    city: city.trim(),
    state: state.trim().toUpperCase(),
    zip: zip.trim(),
  };
}

function requireCustomerAddress(address?: Address): Address {
  if (!address?.line1 || !address.city || !address.state || !address.zip) {
    throw new Error('Mail-in orders require a customer ship-from address before a label can be created.');
  }

  return {
    line1: address.line1.trim(),
    line2: address.line2?.trim() || undefined,
    city: address.city.trim(),
    state: address.state.trim().toUpperCase(),
    zip: address.zip.trim(),
  };
}

function formatShippoMessages(messages?: Array<{ code?: string; text?: string }>) {
  if (!messages || messages.length === 0) return '';
  return messages
    .map((message) => [message.code, message.text].filter(Boolean).join(': '))
    .filter(Boolean)
    .join(' ');
}

function parseMoney(value?: string) {
  if (!value) return undefined;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : undefined;
}
