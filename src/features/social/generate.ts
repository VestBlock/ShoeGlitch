import type {
  SocialContentAngle,
  SocialPageType,
  SocialPayloadDraft,
  SocialPlatformTarget,
  SocialSourceExtract,
} from '@/features/social/types';

function hashtagify(value: string) {
  return value
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join('');
}

function compactHashtag(value: string) {
  const tag = hashtagify(value);
  return tag.length >= 2 && tag.length <= 80 ? `#${tag}` : null;
}

function trimSentence(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function skuHashtag(value: string | null) {
  if (!value) return null;
  const tag = value.replace(/[^a-zA-Z0-9]+/g, '').toUpperCase();
  return tag.length >= 2 && tag.length <= 80 ? `#${tag}` : null;
}

function brandModelLabel(brand: string | null, model: string | null) {
  if (!model) return null;
  if (!brand) return model;
  return model.toLowerCase().startsWith(brand.toLowerCase()) ? model : `${brand} ${model}`;
}

function sneakerHashtagCandidates(source: SocialSourceExtract) {
  const brand = typeof source.metadata.brand === 'string' ? source.metadata.brand : null;
  const model = typeof source.metadata.model === 'string' ? source.metadata.model : null;

  return [
    brandModelLabel(brand, model),
    model,
  ].filter((value): value is string => Boolean(value));
}

function contentAngleForPageType(pageType: SocialPageType): SocialContentAngle {
  if (pageType === 'intelligence') return 'release-radar';
  if (pageType === 'release') return 'release-radar';
  if (pageType === 'how-to-clean') return 'care-guide';
  if (pageType === 'worth-restoring') return 'restoration-read';
  if (pageType === 'release-alerts') return 'release-alert';
  return 'local-service';
}

function buildHook(source: SocialSourceExtract) {
  const brand = typeof source.metadata.brand === 'string' ? source.metadata.brand : null;
  const city = typeof source.metadata.city === 'string' ? source.metadata.city : null;

  switch (source.pageType) {
    case 'intelligence':
      return `${brand ?? 'SNKRS'} watch radar: ${source.title}`;
    case 'release':
      return `${brand ?? 'Sneaker'} drop radar: ${source.title}`;
    case 'how-to-clean':
      return `Before you wear them out, here is the care read on ${source.title}.`;
    case 'worth-restoring':
      return `This pair might deserve restoration more than a basic wipe-down.`;
    case 'release-alerts':
      return `This release is worth tracking before your size disappears.`;
    case 'service-city':
    case 'service-area':
      return city ? `Local sneaker care in ${hashtagify(city)} starts here.` : `Local sneaker care starts here.`;
    default:
      return `Fresh ShoeGlitch insight from the feed and service engine.`;
  }
}

function buildHashtags(source: SocialSourceExtract, socialPlatformTarget: SocialPlatformTarget) {
  const tags = new Set<string>(['#ShoeGlitch', '#SneakerCare', '#SneakerCleaning']);
  const brand = typeof source.metadata.brand === 'string' ? source.metadata.brand : null;
  const city = typeof source.metadata.city === 'string' ? source.metadata.city : null;
  const service = typeof source.metadata.service === 'string' ? source.metadata.service : null;

  for (const candidate of sneakerHashtagCandidates(source)) {
    const tag = compactHashtag(candidate);
    if (tag) tags.add(tag);
  }
  const sku = typeof source.metadata.sku === 'string' ? source.metadata.sku : null;
  const skuTag = skuHashtag(sku);
  if (skuTag) tags.add(skuTag);
  if (brand) {
    const tag = compactHashtag(brand);
    if (tag) tags.add(tag);
  }
  if (city) {
    const tag = compactHashtag(city);
    if (tag) tags.add(tag);
  }
  if (service === 'shoe-restoration' || source.pageType === 'worth-restoring') tags.add('#ShoeRestoration');
  if (source.pageType === 'release' || source.pageType === 'release-alerts') tags.add('#SneakerRelease');
  if (source.pageType === 'how-to-clean') tags.add('#HowToCleanShoes');
  if (service === 'pickup-dropoff') tags.add('#PickupDropoff');

  return Array.from(tags).slice(0, socialPlatformTarget === 'tiktok' ? 5 : 10);
}

function nextRecommendedScheduleAt(source: SocialSourceExtract) {
  const now = new Date();
  const releaseDate = source.publishDate ? new Date(source.publishDate) : null;
  const schedule = new Date(now);

  if (source.pageType === 'release' || source.pageType === 'release-alerts') {
    const base = releaseDate && releaseDate.getTime() > now.getTime() ? releaseDate : now;
    schedule.setTime(base.getTime());
    schedule.setHours(11, 15, 0, 0);
    if (schedule.getTime() <= now.getTime()) schedule.setDate(schedule.getDate() + 1);
    return schedule.toISOString();
  }

  schedule.setHours(18, 30, 0, 0);
  if (schedule.getTime() <= now.getTime()) schedule.setDate(schedule.getDate() + 1);
  return schedule.toISOString();
}

function buildInstagramCaption(source: SocialSourceExtract, hashtags: string[]) {
  const actionLine =
    source.pageType === 'release-alerts'
      ? 'Save the pair, track the drop, and move before the best window closes.'
      : source.pageType === 'how-to-clean'
        ? 'Use the guide, then book the clean before the wear sets in.'
        : source.pageType === 'worth-restoring'
          ? 'Read the restoration case, then decide if the pair deserves deeper work.'
          : 'Open the full page and take the next ShoeGlitch action from there.';
  const intelligenceLine = 'See more on ShoeGlitch Intelligence.';

  return [
    buildHook(source),
    '',
    source.shortSummary,
    '',
    actionLine,
    intelligenceLine,
    '',
    hashtags.join(' '),
  ].join('\n');
}

function buildTikTokCaption(source: SocialSourceExtract, hashtags: string[]) {
  const brand = typeof source.metadata.brand === 'string' ? source.metadata.brand : null;
  const model = typeof source.metadata.model === 'string' ? source.metadata.model : null;
  const shortLabel = trimSentence(brandModelLabel(brand, model) ?? source.title, 72);
  const shortSummary = trimSentence(source.shortSummary, 150);

  const actionLine =
    source.pageType === 'how-to-clean'
      ? 'Care guide + booking path in ShoeGlitch Intelligence.'
      : source.pageType === 'worth-restoring'
        ? 'See the restoration case in ShoeGlitch Intelligence.'
        : source.pageType === 'release-alerts'
          ? 'Track the drop in ShoeGlitch Intelligence.'
          : 'See it in ShoeGlitch Intelligence.';

  return [
    `${shortLabel}`,
    shortSummary,
    actionLine,
    hashtags.join(' '),
  ].join('\n\n');
}

export function buildSocialPayload(
  source: SocialSourceExtract,
  socialPlatformTarget: SocialPlatformTarget,
): SocialPayloadDraft {
  const contentAngle = contentAngleForPageType(source.pageType);
  const hashtags = buildHashtags(source, socialPlatformTarget);
  const caption =
    socialPlatformTarget === 'tiktok'
      ? buildTikTokCaption(source, hashtags)
      : buildInstagramCaption(source, hashtags);

  return {
    contentAngle,
    hook: buildHook(source),
    caption,
    hashtags,
    imageUrl: source.imageUrl,
    canonicalLink: source.canonicalUrl,
    recommendedScheduleAt: nextRecommendedScheduleAt(source),
    socialPlatformTarget,
    postStatus: 'draft',
    metadata: {
      routePath: source.routePath,
      sourceKind: source.sourceKind,
      publishDate: source.publishDate ?? null,
      platform: socialPlatformTarget,
    },
  };
}
