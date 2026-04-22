# Scoring Rules

These are starter rules. Tune them over time. Keep them centralized.

## Example normalizations
- `normalizedSpread = clamp((marketPrice - retailPrice) / max(retailPrice, 1), 0, 1.5)`
- `normalizedDemand = clamp(log(searchInterest + socialMentions + watchCount) / target, 0, 1)`
- `normalizedFreshness = clamp(daysUntilReleaseWindow / window, 0, 1)`

## Example formulas

### Hype score
```
hypeScore =
  0.45 * normalizedDemand +
  0.25 * normalizedRetailerCoverage +
  0.20 * normalizedBrandHeat +
  0.10 * normalizedFreshness
```

### Resale spread
```
resaleSpreadScore =
  clamp((lowestAsk - retailPrice) / retailPrice, -0.25, 1.25)
```

### Cleaning score
Use when the product is likely to create recurring service demand.

Signals:
- light colorways
- mesh, suede, canvas, knit
- high general-wear silhouettes
- historically photographed dirty in resale markets
- affordable enough to justify cleaning over full restoration

### Restoration score
Signals:
- age
- yellowing risk
- premium/high-sentiment silhouettes
- material complexity
- known repaint or sole work demand

### Flip potential
Blend:
- resale spread
- hype
- urgency
- liquidity
- confidence

### Urgency
Blend:
- days to release
- stock scarcity
- price movement velocity
- retailer count changes

### Confidence
Start from:
- source count
- source freshness
- identifier match strength
- historical source reliability

## Avoid fake precision
- Use integer scores in UI.
- Show labels like:
  - `High cleaning upside`
  - `Strong flip signal`
  - `Low-confidence estimate`
- If confidence is low, down-rank or annotate the score instead of pretending certainty.
