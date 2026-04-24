update public.services
set
  slug = 'basic',
  name = 'Basic',
  tagline = 'Steam Clean refresh for everyday pairs.',
  description = 'Steam Clean, upper cleaning, sole cleaning, lace cleaning, and finishing for routine refreshes. Best for daily pairs that need to look clean again without moving into restoration-level work.',
  category = 'clean',
  "basePrice" = 40,
  "estimatedTurnaroundDays" = 3,
  "rushEligible" = true,
  "isAddOn" = false,
  active = true
where id = 'svc_fresh_start';

update public.services
set
  slug = 'pro',
  name = 'Pro',
  tagline = 'Steam Clean plus De-crease and light correction.',
  description = 'Everything in Basic, plus the De-crease method, deeper detailing, and light paint touch-ups. Built for worn pairs that need more correction than a standard refresh.',
  category = 'restoration',
  "basePrice" = 70,
  "estimatedTurnaroundDays" = 4,
  "rushEligible" = true,
  "isAddOn" = false,
  active = true
where id = 'svc_full_reset';

update public.services
set
  active = false
where id = 'svc_fabric_rescue';

update public.services
set
  slug = 'elite',
  name = 'Elite',
  tagline = 'Full restoration access for your hardest pairs.',
  description = 'Everything in Pro, plus Ice method work, basic-color repaint touch-ups, and the highest restoration path we offer. Built for collector pairs, major recovery jobs, and rebottom evaluations or routing when the pair qualifies.',
  category = 'luxury',
  "basePrice" = 150,
  "estimatedTurnaroundDays" = 8,
  "rushEligible" = false,
  "isAddOn" = false,
  active = true
where id = 'svc_revival';

update public.services
set active = false
where id in ('svc_ice_recovery', 'svc_red_bottom', 'svc_full_repaint');

update public.services
set
  description = 'Professional repaint of heel soles for basic colors only. For scuffs, faded lacquer, or a cleaner reset. Not heel tip replacement, structural repair, or complex custom color work.',
  active = false
where id = 'svc_sole_color';
