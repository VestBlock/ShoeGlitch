export const PICKUP_WINDOW_VALUES = ['morning', 'afternoon', 'after_work'] as const;

export type PickupWindow = (typeof PICKUP_WINDOW_VALUES)[number];

export const PICKUP_WINDOW_OPTIONS: Array<{
  value: PickupWindow;
  label: string;
  detail: string;
}> = [
  { value: 'morning', label: 'Morning', detail: 'Best for early pickups' },
  { value: 'afternoon', label: 'Afternoon', detail: 'Midday pickup window' },
  { value: 'after_work', label: 'After work', detail: 'Good after 5 PM' },
];

const PICKUP_WINDOW_RE = /^\[\[pickup_window:(morning|afternoon|after_work)\]\]\s*/;

export function attachPickupWindowToNotes(
  notes: string | undefined,
  pickupWindow: PickupWindow | undefined,
): string | undefined {
  const cleanNotes = stripPickupWindowFromNotes(notes);
  if (!pickupWindow) return cleanNotes;

  return `[[pickup_window:${pickupWindow}]]${cleanNotes ? `\n${cleanNotes}` : ''}`;
}

export function extractPickupWindowFromNotes(
  notes: string | undefined,
): PickupWindow | undefined {
  if (!notes) return undefined;
  const match = notes.match(PICKUP_WINDOW_RE);
  return match?.[1] as PickupWindow | undefined;
}

export function stripPickupWindowFromNotes(
  notes: string | undefined,
): string | undefined {
  if (!notes) return undefined;
  const stripped = notes.replace(PICKUP_WINDOW_RE, '').trim();
  return stripped || undefined;
}

export function pickupWindowLabel(
  pickupWindow: PickupWindow | undefined,
): string | undefined {
  return PICKUP_WINDOW_OPTIONS.find((option) => option.value === pickupWindow)?.label;
}
