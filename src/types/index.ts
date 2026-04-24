// ==========================================================================
// SHOE GLITCH — Domain Types
// City-first, role-first, fulfillment-polymorphic.
// Mirrors the Supabase schema 1:1 so the data layer swap is mechanical.
// ==========================================================================

export type ID = string;

// ---------------------------------------------------------------------------
// Cities & Coverage
// ---------------------------------------------------------------------------
export interface City {
  id: ID;
  name: string;
  slug: string;
  state: string;
  timezone: string;
  active: boolean;
  launchDate: string; // ISO
  defaultPickupFee: number;
  defaultRushFee: number;
  defaultMailInReturnFee: number;
  hubAddress?: string;
}

export interface ServiceArea {
  id: ID;
  cityId: ID;
  name: string;
  zips: string[]; // ZIP codes covered
  radiusMiles?: number; // optional radius-based coverage from city center
  active: boolean;
}

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------
export type Role = 'customer' | 'cleaner' | 'city_manager' | 'super_admin';

export interface User {
  id: ID;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  createdAt: string;
}

export interface Customer {
  id: ID;
  userId: ID;
  name: string;
  email: string;
  phone?: string;
  defaultAddress?: Address;
  defaultCityId?: ID;
  createdAt: string;
}

export type CleanerTier = 'starter' | 'pro' | 'luxury';

export interface Cleaner {
  id: ID;
  userId: ID;
  name: string;
  email: string;
  phone?: string;
  cityId: ID;
  serviceAreaIds: ID[];
  specializations: ServiceCategory[]; // e.g. can handle "luxury" / "restoration"
  tier: CleanerTier; // gates what services they can accept
  active: boolean;
  payoutRate: number; // fraction, e.g. 0.6
  rating: number; // 0..5
  activeJobCount: number; // used by dispatch for load balancing
  createdAt: string;
}

export interface CityManager {
  id: ID;
  userId: ID;
  cityId: ID;
  canOverridePricing: boolean;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

// ---------------------------------------------------------------------------
// Services & Pricing
// ---------------------------------------------------------------------------
export type ServiceCategory =
  | 'clean'
  | 'restoration'
  | 'specialty'
  | 'luxury'
  | 'addon';

export interface Service {
  id: ID;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ServiceCategory;
  basePrice: number;
  priceMin?: number; // for ranged services
  priceMax?: number;
  estimatedTurnaroundDays: number;
  rushEligible: boolean;
  isAddOn: boolean;
  active: boolean;
}

export interface CityServicePricing {
  id: ID;
  cityId: ID;
  serviceId: ID;
  overridePrice?: number; // null/undefined = use base
  rushEligible: boolean;
  active: boolean;
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
export type FulfillmentMethod = 'pickup' | 'dropoff' | 'mailin';

export type ShoeCategory =
  | 'sneakers'
  | 'designer_sneakers'
  | 'womens_heels'
  | 'red_bottom_heels'
  | 'boots'
  | 'kids'
  | 'other';

export type OrderStatus =
  | 'quote_started'
  | 'order_confirmed'
  | 'awaiting_pickup'
  | 'pickup_assigned'
  | 'picked_up'
  | 'awaiting_dropoff'
  | 'awaiting_shipment'
  | 'received_at_hub'
  | 'in_cleaning'
  | 'in_restoration'
  | 'quality_check'
  | 'ready_for_return'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'shipped_back'
  | 'delivered'
  | 'completed'
  | 'issue_flagged'
  | 'awaiting_customer_response'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'authorized' | 'paid' | 'refunded' | 'failed';

export interface OrderItem {
  serviceId: ID;
  serviceName: string;
  unitPrice: number; // resolved price at time of booking
  isAddOn: boolean;
}

export interface Order {
  id: ID;
  code: string; // SG-XXXXXX — human-readable
  customerId: ID;
  cityId: ID;
  serviceAreaId?: ID;
  cleanerId?: ID;

  fulfillmentMethod: FulfillmentMethod;
  shoeCategory: ShoeCategory;
  customShoeType?: string;
  pairCount: number;

  items: OrderItem[]; // includes primary service + add-ons

  status: OrderStatus;
  paymentStatus: PaymentStatus;

  notes?: string;
  conditionIssues?: string;
  beforeImages: string[]; // URLs
  afterImages: string[];

  pickupAddress?: Address;
  returnAddress?: Address;
  mailInLabelUrl?: string;
  mailInTrackingNumber?: string;
  mailInTrackingUrl?: string;
  mailInCarrier?: string;
  mailInServiceLevel?: string;
  mailInShippoShipmentId?: string;
  mailInShippoTransactionId?: string;
  mailInLabelCreatedAt?: string;
  mailInLabelCost?: number;
  mailInLabelCurrency?: string;

  subtotal: number;
  pickupFee: number;
  rushFee: number;
  returnShippingFee: number;
  discount: number;
  total: number;

  isRush: boolean;
  couponCode?: string;

  scheduledPickupAt?: string;
  scheduledDeliveryAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderEvent {
  id: ID;
  orderId: ID;
  status: OrderStatus;
  actorRole: Role | 'system';
  actorId?: ID;
  note?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------
export interface Coupon {
  code: string;
  percentOff?: number;
  amountOff?: number;
  cityId?: ID; // null = global
  active: boolean;
  expiresAt?: string;
}

export interface Session {
  userId: ID;
  email: string;
  name: string;
  role: Role;
  cityId?: ID; // for cleaners + city managers
}
