import type { Address } from '@/types';

const DEFAULT_MAIL_IN_HUB_ADDRESS: Address = {
  line1: '4745 Spartan Lane',
  city: 'Brookfield',
  state: 'WI',
  zip: '53005',
};

export function getNationalMailInHubAddress(): Address {
  const line1 = process.env.SHIPPO_MAILIN_HUB_LINE1?.trim();
  const city = process.env.SHIPPO_MAILIN_HUB_CITY?.trim();
  const state = process.env.SHIPPO_MAILIN_HUB_STATE?.trim();
  const zip = process.env.SHIPPO_MAILIN_HUB_ZIP?.trim();

  if (!line1 || !city || !state || !zip) {
    return DEFAULT_MAIL_IN_HUB_ADDRESS;
  }

  return {
    line1,
    line2: process.env.SHIPPO_MAILIN_HUB_LINE2?.trim() || undefined,
    city,
    state,
    zip,
  };
}

export function formatAddressSingleLine(address: Address) {
  return [address.line1, address.line2, `${address.city}, ${address.state} ${address.zip}`]
    .filter(Boolean)
    .join(', ');
}

export function getNationalMailInHubAddressLabel() {
  return formatAddressSingleLine(getNationalMailInHubAddress());
}
