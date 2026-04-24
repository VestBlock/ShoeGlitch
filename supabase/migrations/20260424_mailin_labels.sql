alter table public.orders
  add column if not exists "mailInLabelUrl" text,
  add column if not exists "mailInTrackingNumber" text,
  add column if not exists "mailInTrackingUrl" text,
  add column if not exists "mailInCarrier" text,
  add column if not exists "mailInServiceLevel" text,
  add column if not exists "mailInShippoShipmentId" text,
  add column if not exists "mailInShippoTransactionId" text,
  add column if not exists "mailInLabelCreatedAt" timestamptz,
  add column if not exists "mailInLabelCost" numeric,
  add column if not exists "mailInLabelCurrency" text;

create index if not exists orders_mailin_shippo_transaction_idx
  on public.orders ("mailInShippoTransactionId");
