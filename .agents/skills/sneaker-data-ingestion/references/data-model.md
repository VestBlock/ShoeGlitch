# Sneaker Intelligence Data Model

Use these boundaries when designing ingestion and persistence.

## Sneaker
- `id`
- `slug`
- `brand`
- `silhouette`
- `modelName`
- `sku`
- `colorway`
- `gender`
- `retailPrice`
- `currency`
- `description`
- `primaryImage`
- `images`
- `releaseDate`
- `status` (`upcoming`, `live`, `sold-out`, `rumored`, `archived`)
- `sourceIds`
- `updatedAt`

## SourceListing
- `source`
- `sourceId`
- `sourceUrl`
- `rawPayload`
- `fetchedAt`
- `normalizedAt`
- `parseStatus`
- `confidence`

## ReleaseEvent
- `sneakerId`
- `releaseDate`
- `releaseType`
- `region`
- `retailers`
- `status`

## MarketplacePriceSnapshot
- `sneakerId`
- `marketplace`
- `capturedAt`
- `lowestAsk`
- `highestBid`
- `lastSale`
- `salesVolume`
- `priceCurrency`

## ScoreRecord
- `sneakerId`
- `computedAt`
- `hypeScore`
- `resaleSpread`
- `cleaningScore`
- `restorationScore`
- `flipPotential`
- `urgency`
- `confidence`
- `inputs`

## SneakerImage
- `url`
- `alt`
- `source`
- `width`
- `height`
- `kind` (`hero`, `angled`, `detail`, `on-foot`)

## RetailerLink
- `name`
- `url`
- `region`
- `releaseType`
- `affiliateTag`

## Separation rule
- Raw records are for traceability.
- Normalized records are for app logic.
- Scored records are for ranking.
- UI view models are derived from normalized plus scored data, never from raw payloads.
