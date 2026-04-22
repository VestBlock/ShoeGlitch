type ShoeProfile = {
  brand?: string;
  title?: string;
};

const SHOE_BRAND_RE = /^\[\[shoe_brand:([^\]]+)\]\]$/m;
const SHOE_TITLE_RE = /^\[\[shoe_title:([^\]]+)\]\]$/m;
const SHOE_PROFILE_LINE_RE = /^\[\[(shoe_brand|shoe_title):[^\]]+\]\]\s*\n?/gm;
const PICKUP_WINDOW_LINE_RE = /^(\[\[pickup_window:[^\]]+\]\])\s*/;

function cleanTagValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const sanitized = value.replace(/[\[\]\r\n]+/g, ' ').trim();
  return sanitized || undefined;
}

export function extractShoeProfileFromNotes(notes: string | undefined): ShoeProfile {
  if (!notes) return {};

  return {
    brand: notes.match(SHOE_BRAND_RE)?.[1],
    title: notes.match(SHOE_TITLE_RE)?.[1],
  };
}

export function stripShoeProfileFromNotes(notes: string | undefined): string | undefined {
  if (!notes) return undefined;
  const stripped = notes.replace(SHOE_PROFILE_LINE_RE, '').trim();
  return stripped || undefined;
}

export function attachShoeProfileToNotes(
  notes: string | undefined,
  profile: ShoeProfile,
): string | undefined {
  const cleanNotes = stripShoeProfileFromNotes(notes);
  const brand = cleanTagValue(profile.brand);
  const title = cleanTagValue(profile.title);

  if (!brand && !title) return cleanNotes;

  const profileLines = [
    brand ? `[[shoe_brand:${brand}]]` : undefined,
    title ? `[[shoe_title:${title}]]` : undefined,
  ].filter(Boolean) as string[];

  if (!cleanNotes) return profileLines.join('\n');

  const pickupMatch = cleanNotes.match(PICKUP_WINDOW_LINE_RE);
  if (!pickupMatch) return [...profileLines, cleanNotes].join('\n');

  const pickupLine = pickupMatch[1];
  const remainder = cleanNotes.slice(pickupMatch[0].length).trimStart();

  return [pickupLine, ...profileLines, remainder].filter(Boolean).join('\n');
}

export function formatShoeProfile(profile: ShoeProfile): string | undefined {
  const parts = [profile.brand, profile.title].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : undefined;
}
