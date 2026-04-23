import type { Metadata } from 'next';
import type { City, ServiceArea } from '@/types';
import { SITE_URL } from '@/features/operator-seo/catalog';
import {
  buildGuideLinks,
  buildOperatorCityLinks,
  buildOperatorHubLinks,
  buildPickupOperatorLinks,
} from '@/features/operator-seo/internal-links';
import type { OperatorRoleSlug, OperatorSeoModel } from '@/features/operator-seo/types';
import { getActiveSeoCities, getSeoCityBySlug, getSeoServiceAreasByCity } from '@/features/seo/data';

const leadFields = [
  { label: 'Full name', helper: 'Basic contact and identity information.', live: true },
  { label: 'Email + phone', helper: 'Current live application already collects this.', live: true },
  { label: 'City and state', helper: 'City prefill can route the lead toward the right market.', live: true },
  { label: 'Vehicle access', helper: 'Needed for pickup and drop-off heavy roles.', live: false },
  { label: 'Experience', helper: 'Useful for cleaning, restoration, or logistics screening.', live: true },
  { label: 'Interest type', helper: 'Cleaning, restoration, pickup/drop-off, or city launch interest.', live: false },
  { label: 'Availability + notes', helper: 'Great next-step intake fields for conversion-quality leads.', live: false },
] as const;

function cityLabel(city: City) {
  return `${city.name}, ${city.state}`;
}

function serviceAreaSummary(areas: ServiceArea[]) {
  if (areas.length === 0) return 'mail-in support while local coverage expands';
  if (areas.length === 1) return areas[0].name;
  if (areas.length === 2) return `${areas[0].name} and ${areas[1].name}`;
  return `${areas[0].name}, ${areas[1].name}, and ${areas.length - 2} more service areas`;
}

function operatorAnswerBlock(role: OperatorRoleSlug, city?: City, areaCount?: number) {
  const location = city ? ` in ${city.name}` : '';
  const localScale =
    city && typeof areaCount === 'number'
      ? ` Shoe Glitch already maps ${Math.max(areaCount, 1)} active local service areas there.`
      : '';

  if (role === 'pickup-dropoff') {
    return `A pickup and drop-off operator${location} handles route coordination, intake handoff, and premium local logistics for customers who want service without friction.${localScale}`;
  }

  if (role === 'restoration') {
    return `A Shoe Glitch restoration operator${location} takes on higher-trust repair and finish work, with brand standards, city support, and a cleaner path to local demand.${localScale}`;
  }

  return `A Shoe Glitch cleaning operator${location} turns sneaker-care demand into a real territory opportunity with tools, training, standards, and a live application path.${localScale}`;
}

function buildMetadata(model: OperatorSeoModel): Metadata {
  return {
    title: model.title,
    description: model.description,
    alternates: {
      canonical: model.canonicalUrl,
    },
    openGraph: {
      title: model.title,
      description: model.description,
      url: model.canonicalUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: model.title,
      description: model.description,
    },
  };
}

export function buildOperatorMetadata(model: OperatorSeoModel): Metadata {
  return buildMetadata(model);
}

export async function buildOperatorsIndexPageModel(): Promise<OperatorSeoModel> {
  const cities = await getActiveSeoCities();

  return {
    kind: 'operators-index',
    path: '/operators',
    canonicalUrl: `${SITE_URL}/operators`,
    title: 'ShoeGlitch operator opportunities | City-by-city operator growth',
    description:
      'Explore ShoeGlitch operator opportunities by city, see what operators do, and move into a real application or waitlist path.',
    h1: 'Operator opportunities built for city expansion.',
    eyebrow: 'Operator recruitment hub',
    intro:
      'This is the index for ShoeGlitch operator acquisition pages: city launch opportunities, pickup and drop-off roles, side-hustle guides, and the main path into the live operator application.',
    quickAnswer:
      'ShoeGlitch operators handle sneaker cleaning, restoration support, and local pickup or drop-off workflows in active or opening markets.',
    summaryBullets: [
      'Find city-by-city operator opportunity pages.',
      'See how roles differ between cleaning, restoration, and local logistics.',
      'Use the live application path instead of reading a dead-end recruiting page.',
    ],
    whoItsFor: [
      'People who want to operate in a specific city.',
      'Side-hustle seekers who can turn local demand into consistent work.',
      'Sneaker-care specialists who want a stronger operating system behind them.',
    ],
    whatOperatorsDo: [
      'Handle cleaning, restoration, or pickup/drop-off workflows based on capability and market needs.',
      'Follow ShoeGlitch intake, quality, and customer-experience standards.',
      'Work inside a city-focused service footprint instead of trying to build from zero alone.',
    ],
    whatShoeGlitchProvides: [
      'Operator kit tiers, training, and route-ready standards.',
      'Brand, customer acquisition, and city-aware operational framing.',
      'A clear application path tied to real cities instead of generic “work with us” copy.',
    ],
    operatorResponsibilities: [
      'Show up consistently and follow quality standards.',
      'Handle intake notes, timing, and customer handoff cleanly.',
      'Choose the right tier and role path for the work you can actually deliver.',
    ],
    sections: [
      {
        heading: 'What this operator hub is for',
        paragraphs: [
          'The point of this page is not just to say “become an operator.” It exists to route operator-intent traffic into the correct city page, role page, or application path so ShoeGlitch can turn organic interest into expansion-ready leads.',
          'That makes it useful for both SEO and AEO: search engines get a clear recruitment hub, and AI systems can extract a clean answer about what the opportunity is, who it fits, and where to apply.',
        ],
      },
      {
        heading: 'How ShoeGlitch should recruit operators',
        paragraphs: [
          'Operator acquisition works best when the pages are specific. Someone searching for a sneaker cleaning business opportunity in Milwaukee is not looking for vague brand copy. They want territory context, role clarity, and a believable next step.',
        ],
        bullets: [
          'City pages explain local opportunity fit.',
          'Role pages explain what work the operator actually does.',
          'Guide pages capture “how to start” and side-hustle intent before it goes cold.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is a ShoeGlitch operator?',
        shortAnswer:
          'A ShoeGlitch operator is a local partner who handles sneaker care or logistics inside an active or opening city.',
        answer:
          'A ShoeGlitch operator is a local partner who handles sneaker cleaning, restoration-support work, or pickup and drop-off workflows inside an active or opening city. The exact role depends on tier, capability, and market needs.',
      },
      {
        question: 'Do I need my own city to apply?',
        shortAnswer: 'No. You can apply into an active market or express interest for an opening city.',
        answer:
          'No. You can apply into an active market today, or use the city opportunity pages to signal interest where ShoeGlitch is still expanding. The goal is to capture qualified operator intent early instead of waiting until a city is fully saturated.',
      },
      {
        question: 'Is this page just informational?',
        shortAnswer: 'No. It is a conversion hub designed to move operator-intent traffic into the live application flow.',
        answer:
          'No. This page is designed to move operator-intent traffic into the live application flow, city-specific operator pages, and role-specific opportunity pages. It is not a generic hiring blog.',
      },
    ],
    cta: {
      eyebrow: 'Apply or explore',
      headline: 'Pick your city, understand the role, then move into the live operator application.',
      body: 'Use the active city pages and role pages to see where ShoeGlitch is strongest, then apply through the existing operator flow.',
      primaryHref: '/operator/apply?tier=starter',
      primaryLabel: 'Apply now',
      secondaryHref: '/operator',
      secondaryLabel: 'See operator kits',
    },
    links: buildOperatorHubLinks(cities),
    leadFields: [...leadFields],
    featuredCities: cities.slice(0, 6),
    earningsFrame:
      'Frame earnings around territory support, route quality, and service mix instead of unrealistic monthly-income promises.',
  };
}

export async function buildBecomeOperatorPageModel(): Promise<OperatorSeoModel> {
  const cities = await getActiveSeoCities();

  return {
    kind: 'become-operator',
    path: '/become-an-operator',
    canonicalUrl: `${SITE_URL}/become-an-operator`,
    title: 'Become a ShoeGlitch operator | Sneaker cleaning and local route opportunity',
    description:
      'Become a ShoeGlitch operator and learn what the opportunity includes, who it fits, and how to apply in an active or opening city.',
    h1: 'Become a ShoeGlitch operator.',
    eyebrow: 'Operator acquisition page',
    intro:
      'ShoeGlitch operators are not random gig workers. They are city-level partners who can handle cleaning, restoration-support work, or local pickup/drop-off execution with brand standards and operator tooling behind them.',
    quickAnswer: operatorAnswerBlock('cleaning'),
    summaryBullets: [
      'Clear explanation of what operators do.',
      'Territory and city opportunity framing without inflated promises.',
      'A live path into the existing operator application.',
    ],
    whoItsFor: [
      'People who already care about sneakers and want structured local earning potential.',
      'Operators who can work consistently inside a city or launch market.',
      'Applicants who want systems, training, and demand support instead of solo guesswork.',
    ],
    whatOperatorsDo: [
      'Clean and restore sneakers to ShoeGlitch standards.',
      'Coordinate pickup/drop-off where the market needs route support.',
      'Represent the brand through intake quality, turnaround discipline, and customer communication.',
    ],
    whatShoeGlitchProvides: [
      'Tiered kit system and service certification path.',
      'Brand standards, city-aware routing, and customer acquisition support.',
      'A cleaner growth path from starter operator to higher-trust restoration or specialty work.',
    ],
    operatorResponsibilities: [
      'Maintain quality and brand standards.',
      'Operate inside the assigned city and service footprint.',
      'Choose the right work type for your skill level instead of overextending.',
    ],
    sections: [
      {
        heading: 'What operators actually do',
        paragraphs: [
          'The operator opportunity is a real operating role, not just a lead form. Operators clean pairs, handle intake quality, and in some cities take on pickup and drop-off responsibilities that keep the customer experience friction-light.',
          'As the operator proves capability, the role can expand into higher-trust restoration work or broader territory support.',
        ],
      },
      {
        heading: 'Who this opportunity is for',
        paragraphs: [
          'This path is strongest for someone who is reliable, quality-sensitive, and comfortable turning local demand into real, repeatable service. It fits people who want a structured sneaker-care opportunity rather than a vague “start a side hustle” promise.',
        ],
        bullets: [
          'People with sneaker-care experience or willingness to train.',
          'People with city-level availability and customer discipline.',
          'People who want to operate with a brand and system behind them.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'The next step is simple: review the opportunity, choose your city or city of interest, understand the tier fit, then move into the live operator application flow already running on ShoeGlitch.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What does ShoeGlitch provide to operators?',
        shortAnswer: 'Kits, training, standards, and a city-aware path into real customer demand.',
        answer:
          'ShoeGlitch provides operator kits, service certification, brand standards, and a city-aware operating path designed to turn local sneaker-care demand into a cleaner business opportunity.',
      },
      {
        question: 'What is the main next step from this page?',
        shortAnswer: 'The live operator application at /operator/apply.',
        answer:
          'The main next step is the existing operator application at /operator/apply. This page exists to qualify intent and route the right applicants into that flow with better city and role context.',
      },
      {
        question: 'Can this expand city by city?',
        shortAnswer: 'Yes. The page system is built to scale into city, role, and side-hustle route families.',
        answer:
          'Yes. The operator SEO system is designed to scale city by city and role by role, so ShoeGlitch can recruit for new markets without publishing thin copy or one-off pages.',
      },
    ],
    cta: {
      eyebrow: 'Operator application',
      headline: 'Start with the main operator path, then narrow into your city and role.',
      body: 'Apply directly, or explore city-specific opportunity pages if you want a more local read on where ShoeGlitch is growing.',
      primaryHref: '/operator/apply?tier=starter',
      primaryLabel: 'Apply now',
      secondaryHref: '/operators',
      secondaryLabel: 'Explore operator pages',
    },
    links: buildOperatorHubLinks(cities),
    leadFields: [...leadFields],
    featuredCities: cities.slice(0, 6),
    earningsFrame:
      'Better territory support, route quality, and service mix can improve operator earnings over time, but no page should promise guaranteed income.',
  };
}

export async function buildOperatorCityPageModel(citySlug: string): Promise<OperatorSeoModel | undefined> {
  const [city, cities] = await Promise.all([getSeoCityBySlug(citySlug), getActiveSeoCities()]);
  if (!city) return undefined;

  const serviceAreas = await getSeoServiceAreasByCity(city.id);
  const areaSummary = serviceAreaSummary(serviceAreas);
  const cityName = cityLabel(city);

  return {
    kind: 'operator-city',
    path: `/operator-opportunities/${city.slug}`,
    canonicalUrl: `${SITE_URL}/operator-opportunities/${city.slug}`,
    title: `Become a ShoeGlitch operator in ${cityName} | Sneaker cleaning opportunity`,
    description: `Become a ShoeGlitch operator in ${cityName}. Learn what operators do, how the city opportunity works, and how to apply or express interest.`,
    h1: `Become a ShoeGlitch operator in ${city.name}.`,
    eyebrow: 'City operator opportunity',
    intro:
      `This page is built for people searching for a sneaker cleaning business opportunity, sneaker-care side hustle, or city operator role in ${cityName}. It explains the market opportunity, the work, and the real next step.`,
    quickAnswer: operatorAnswerBlock('cleaning', city, serviceAreas.length),
    summaryBullets: [
      `${cityName} already maps to ${areaSummary}.`,
      'Operators can support cleaning, restoration-growth, and city logistics as the market deepens.',
      'The live application path already exists and can be used with this city context.',
    ],
    whoItsFor: [
      `People based in or near ${city.name} who can operate consistently.`,
      'People who want structured local demand rather than freelance guesswork.',
      'Applicants who can handle quality control, timing, and customer handoff.',
    ],
    whatOperatorsDo: [
      `Handle sneaker-care work tied to the ${city.name} market footprint.`,
      'Maintain intake quality, service standards, and route discipline.',
      'Grow into deeper restoration or local logistics as the city matures.',
    ],
    whatShoeGlitchProvides: [
      'Brand, demand-generation, and a cleaner route into local customer jobs.',
      'Operator kit tiers and certification path.',
      `A city-specific recruitment angle tied to real coverage in ${city.name}.`,
    ],
    operatorResponsibilities: [
      `Cover the ${city.name} opportunity professionally.`,
      'Choose the tier and service path that fit your capability.',
      'Represent the brand with consistency and customer care.',
    ],
    sections: [
      {
        heading: `Why ${city.name} is an operator market`,
        paragraphs: [
          `${cityName} is already represented on the customer side through live service and coverage pages. That means this operator page is tied to a real market footprint, not a fake local SEO angle.`,
          `For operator acquisition, that matters. A credible city page should explain why the market exists, how the role fits the city, and what a realistic path into the business looks like.`,
        ],
      },
      {
        heading: `What the ${city.name} operator role looks like`,
        paragraphs: [
          `In ${city.name}, the role starts with dependable sneaker-care execution and can expand into local route work, repeat customer handling, and higher-trust services as performance improves.`,
        ],
        bullets: [
          'Daily pair intake and service execution.',
          'Customer-ready communication and handoff quality.',
          'Potential local route and territory support as demand grows.',
        ],
      },
      {
        heading: 'How to apply or express interest',
        paragraphs: [
          'The main next step is the operator application. This page adds the local context, so applicants from the city know why the opportunity exists and what ShoeGlitch expects before they submit.',
        ],
      },
    ],
    faqs: [
      {
        question: `Is ShoeGlitch actively recruiting operators in ${city.name}?`,
        shortAnswer: `Yes. ${city.name} is part of the operator recruitment system and can route applicants into the live application flow.`,
        answer:
          `${city.name} is part of the operator recruitment system, which means applicants can use this city page to understand the opportunity and move into the live application flow with better local context.`,
      },
      {
        question: `What kind of operator work exists in ${city.name}?`,
        shortAnswer: 'Cleaning-first work, with room for route support and higher-trust services as the market grows.',
        answer:
          `The role starts with sneaker cleaning and customer-ready execution. Depending on the market and operator performance, it can expand into route support, restoration-growth work, or wider city responsibilities.`,
      },
      {
        question: 'Does this page replace the operator application?',
        shortAnswer: 'No. It supports SEO and AEO, then routes people into the existing application flow.',
        answer:
          'No. This page does not replace the operator application. It exists to rank for local opportunity intent, answer real questions, and then route qualified applicants into the live operator application flow.',
      },
    ],
    cta: {
      eyebrow: 'Apply in market',
      headline: `If ${city.name} is your city, move from local search intent into a real operator application.`,
      body: `Use the existing operator application with ${city.name} preselected, or review the current operator kit path before you apply.`,
      primaryHref: `/operator/apply?tier=starter&city=${city.slug}`,
      primaryLabel: `Apply in ${city.name}`,
      secondaryHref: '/operator',
      secondaryLabel: 'Review operator kits',
    },
    links: buildOperatorCityLinks(city, cities),
    leadFields: [...leadFields],
    featuredCities: cities.slice(0, 6),
    city,
    role: 'cleaning',
    territorySummary: `${city.name} currently maps to ${areaSummary}. That gives operator acquisition a real local operating story instead of generic expansion copy.`,
    earningsFrame:
      'Earnings should be framed by territory depth, service mix, consistency, and customer volume rather than guaranteed income claims.',
  };
}

export async function buildPickupDropoffOperatorCityPageModel(
  citySlug: string,
): Promise<OperatorSeoModel | undefined> {
  const [city, cities] = await Promise.all([getSeoCityBySlug(citySlug), getActiveSeoCities()]);
  if (!city) return undefined;

  const serviceAreas = await getSeoServiceAreasByCity(city.id);
  const areaSummary = serviceAreaSummary(serviceAreas);
  const cityName = cityLabel(city);

  return {
    kind: 'pickup-operator-city',
    path: `/pickup-dropoff-operator/${city.slug}`,
    canonicalUrl: `${SITE_URL}/pickup-dropoff-operator/${city.slug}`,
    title: `Pickup and drop-off operator in ${cityName} | ShoeGlitch local route opportunity`,
    description: `Pickup and drop-off operator opportunity in ${cityName}. Learn what the local logistics role includes and how to apply with ShoeGlitch.`,
    h1: `Pickup & drop-off operator in ${city.name}.`,
    eyebrow: 'Local route opportunity',
    intro:
      `This page targets people searching for a mobile sneaker cleaning job, local pickup route opportunity, or side hustle tied to sneaker care in ${cityName}.`,
    quickAnswer: operatorAnswerBlock('pickup-dropoff', city, serviceAreas.length),
    summaryBullets: [
      `${cityName} already has a real local service footprint: ${areaSummary}.`,
      'This role is best for applicants with strong local reliability and vehicle access.',
      'The page routes into the same live operator application flow with better logistics context.',
    ],
    whoItsFor: [
      'People with reliable transportation and city familiarity.',
      'Applicants who prefer local route coordination and customer handoff over bench-only work.',
      'People who want a logistics-first entry into the ShoeGlitch operator system.',
    ],
    whatOperatorsDo: [
      'Handle pickup and drop-off coordination across active service areas.',
      'Protect intake quality by keeping handoff, timing, and notes clean.',
      'Support the service experience that sits around sneaker cleaning and restoration work.',
    ],
    whatShoeGlitchProvides: [
      'City-aware coverage framing and customer demand flow.',
      'A live path into operator application and later role expansion.',
      'Brand standards that make local logistics feel premium instead of improvised.',
    ],
    operatorResponsibilities: [
      'Maintain reliable transportation and on-time handoff discipline.',
      `Operate cleanly inside ${city.name} service areas.`,
      'Capture accurate notes so the care workflow downstream stays strong.',
    ],
    sections: [
      {
        heading: `Why a pickup role matters in ${city.name}`,
        paragraphs: [
          `Local sneaker service is not only about the clean itself. In ${cityName}, pickup and drop-off can be the difference between browsing and booking. This role is what makes that convenience real.`,
        ],
      },
      {
        heading: 'What the role looks like day to day',
        paragraphs: [
          'The pickup and drop-off operator role is logistics-first. It rewards reliability, city awareness, and the ability to protect intake quality while keeping the customer experience smooth.',
        ],
        bullets: [
          'Coordinate local handoffs and route timing.',
          'Represent the brand professionally at the customer touchpoint.',
          'Keep order notes and intake context accurate for downstream service work.',
        ],
      },
      {
        heading: 'How to move forward',
        paragraphs: [
          `Use the existing operator application with ${city.name} preselected. This page exists to capture route-intent traffic and send the strongest applicants into the current operator funnel.`,
        ],
      },
    ],
    faqs: [
      {
        question: `Who is a good fit for the pickup operator role in ${city.name}?`,
        shortAnswer: 'Someone reliable, local, and comfortable handling customer-facing logistics.',
        answer:
          `A strong pickup operator in ${city.name} is reliable, local, vehicle-ready, and comfortable handling customer-facing logistics while protecting the intake process for the rest of the ShoeGlitch workflow.`,
      },
      {
        question: 'Is this the same as a full cleaning operator role?',
        shortAnswer: 'Not exactly. It is a logistics-first operator path that can sit alongside broader operator growth.',
        answer:
          'Not exactly. The pickup and drop-off role is logistics-first, though it can sit alongside broader operator growth. Some applicants may start here and later expand into cleaning or restoration-support responsibilities.',
      },
      {
        question: 'What is the main next step from this page?',
        shortAnswer: 'The existing operator application with city context.',
        answer:
          'The main next step from this page is the existing operator application. This page adds role and city context so applicants understand what kind of opportunity they are stepping into before they apply.',
      },
    ],
    cta: {
      eyebrow: 'Local routes',
      headline: `Use the ${city.name} route opportunity as your entry into ShoeGlitch operations.`,
      body: 'Apply with city context, or review the current operator tiers before you commit.',
      primaryHref: `/operator/apply?tier=starter&city=${city.slug}&focus=pickup-dropoff`,
      primaryLabel: `Apply for ${city.name} routes`,
      secondaryHref: '/operator',
      secondaryLabel: 'See operator tiers',
    },
    links: buildPickupOperatorLinks(cities, city),
    leadFields: [...leadFields],
    featuredCities: cities.slice(0, 6),
    city,
    role: 'pickup-dropoff',
    territorySummary: `${city.name} is already tied to ${areaSummary}, which gives pickup and drop-off recruitment a real local context.`,
    earningsFrame:
      'Frame this as local route opportunity and customer-handling leverage, not as a guaranteed courier-income promise.',
  };
}

export async function buildStartSneakerCleaningBusinessPageModel(): Promise<OperatorSeoModel> {
  const cities = await getActiveSeoCities();

  return {
    kind: 'business-guide',
    path: '/start-a-sneaker-cleaning-business',
    canonicalUrl: `${SITE_URL}/start-a-sneaker-cleaning-business`,
    title: 'How to start a sneaker cleaning business | ShoeGlitch operator path',
    description:
      'Learn how to start a sneaker cleaning business the realistic way and how ShoeGlitch can shorten the path into city-level operator work.',
    h1: 'How to start a sneaker cleaning business without guessing.',
    eyebrow: 'Business-start guide',
    intro:
      'People searching this topic usually want more than generic business advice. They want to know what equipment matters, what demand looks like, and whether there is a faster path than building everything from zero.',
    quickAnswer:
      'The fastest realistic path is to combine real sneaker-care skill with a structured operating system, city demand, and a live application path instead of starting from scratch with no routing, brand, or customer flow.',
    summaryBullets: [
      'Explain the real work, not just the dream.',
      'Show the difference between solo guesswork and a structured operator model.',
      'Give serious applicants a clear next step when they are ready.',
    ],
    whoItsFor: [
      'People researching sneaker cleaning as a real local business.',
      'Side-hustle searchers who want a path with standards and support.',
      'Applicants considering ShoeGlitch as a faster way into the market.',
    ],
    whatOperatorsDo: [
      'Clean and maintain sneakers to standard.',
      'Build repeat trust through quality, consistency, and customer care.',
      'Operate inside a city system rather than improvising every process alone.',
    ],
    whatShoeGlitchProvides: [
      'Structured operator kits and training.',
      'Brand standards and route-ready systems.',
      'A stronger route from search intent into the real operator application.',
    ],
    operatorResponsibilities: [
      'Take the work seriously as an operating role, not a hobby.',
      'Stay quality-first instead of speed-first.',
      'Use the right tier and city opportunity rather than overpromising.',
    ],
    sections: [
      {
        heading: 'What most “start a sneaker cleaning business” pages get wrong',
        paragraphs: [
          'Most content in this category is generic. It talks about hustle, social media, and profit without explaining operations, standards, route logistics, or how to create trust fast enough to earn repeat business.',
          'ShoeGlitch should rank by being more useful: explain the work, explain the standards, and explain how a structured operator path reduces the hardest part of getting started.',
        ],
      },
      {
        heading: 'The practical path',
        paragraphs: [
          'A real sneaker-cleaning business starts with skill, consistency, and an operating system. The operator path works because it gives applicants a stronger starting point than buying random supplies and hoping local demand appears.',
        ],
        bullets: [
          'Get the right basic tools and workflow.',
          'Understand your city, route, and customer fit.',
          'Use a system that already connects the work to demand.',
        ],
      },
      {
        heading: 'When ShoeGlitch is the better move',
        paragraphs: [
          'If the goal is to build income and territory leverage faster, the ShoeGlitch operator path is often stronger than going fully solo. You still need discipline and quality, but the brand, city framing, and customer flow reduce wasted time.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can ShoeGlitch help me start a sneaker cleaning business?',
        shortAnswer: 'Yes. The operator path gives you a structured entry instead of forcing you to invent the whole system alone.',
        answer:
          'Yes. ShoeGlitch can shorten the path by giving you a structured operator model, city-aware opportunity framing, and a live application path instead of forcing you to invent the whole system alone.',
      },
      {
        question: 'Is this a generic business guide?',
        shortAnswer: 'No. It is written to convert real sneaker-care intent into an operator opportunity.',
        answer:
          'No. This page is not meant to be generic blog traffic bait. It is built to answer real sneaker-care business intent and route serious people into the ShoeGlitch operator system.',
      },
      {
        question: 'What should I do next if I am serious?',
        shortAnswer: 'Review the operator path, choose a city angle, and start the application.',
        answer:
          'If you are serious, the next best move is to review the operator opportunity, choose the city or city-interest angle that fits you, and use the existing operator application flow.',
      },
    ],
    cta: {
      eyebrow: 'Business-start CTA',
      headline: 'Use ShoeGlitch as the structured version of starting from scratch.',
      body: 'Move from research into action with the operator application or a city-specific opportunity page.',
      primaryHref: '/become-an-operator',
      primaryLabel: 'See the operator path',
      secondaryHref: '/operator/apply?tier=starter',
      secondaryLabel: 'Start your application',
    },
    links: buildGuideLinks(cities),
    leadFields: [...leadFields],
    featuredCities: cities.slice(0, 6),
    role: 'cleaning',
    earningsFrame:
      'Talk about realistic operating leverage, territory depth, and customer volume rather than inflated “make X per month” promises.',
  };
}

export async function buildShoeRestorationSideHustlePageModel(): Promise<OperatorSeoModel> {
  const cities = await getActiveSeoCities();

  return {
    kind: 'side-hustle-guide',
    path: '/shoe-restoration-side-hustle',
    canonicalUrl: `${SITE_URL}/shoe-restoration-side-hustle`,
    title: 'Shoe restoration side hustle | ShoeGlitch operator and restoration path',
    description:
      'Explore shoe restoration as a side hustle, understand when it becomes a real opportunity, and see how ShoeGlitch can support the path.',
    h1: 'Shoe restoration as a side hustle, but with real standards.',
    eyebrow: 'Restoration guide',
    intro:
      'Restoration intent is higher trust than generic sneaker cleaning. People searching this topic want to know whether the work is worth learning, what kind of pairs justify it, and how to turn that skill into something real.',
    quickAnswer:
      'Shoe restoration becomes a strong side hustle when the operator can handle premium materials, finish-sensitive work, and higher-trust pairs with consistent standards rather than guesswork.',
    summaryBullets: [
      'Position restoration as trust-heavy, not hype-heavy.',
      'Show how restoration work differs from simple cleaning.',
      'Route serious prospects into the broader operator path without faking expertise claims.',
    ],
    whoItsFor: [
      'People with detail-oriented skill or the willingness to train into it.',
      'Operators who want higher-trust work than simple surface cleaning.',
      'Applicants interested in premium and collector pair care over time.',
    ],
    whatOperatorsDo: [
      'Assess whether a pair needs cleaning, restoration, or both.',
      'Work carefully with premium materials, finish-sensitive surfaces, and preservation-first jobs.',
      'Operate with tighter quality control because restoration mistakes are harder to undo.',
    ],
    whatShoeGlitchProvides: [
      'A path from entry-level operator work toward higher-trust restoration.',
      'Kit tiers and standards that separate routine work from premium work.',
      'A city-aware brand that can turn restoration intent into real leads over time.',
    ],
    operatorResponsibilities: [
      'Do not overclaim restoration capability.',
      'Treat preservation and quality control as the core of the work.',
      'Build into restoration with discipline instead of skipping the fundamentals.',
    ],
    sections: [
      {
        heading: 'Why restoration is different',
        paragraphs: [
          'Restoration is not just “cleaning but more expensive.” It is trust-heavy work that often touches collector pairs, premium materials, or finish-sensitive problems where a careless shortcut can destroy value.',
        ],
      },
      {
        heading: 'What makes the side hustle real',
        paragraphs: [
          'A real restoration side hustle is built on repeatable quality, not flashy before-and-after clips alone. ShoeGlitch should be explicit about that, because the strongest applicants will respect the standard instead of being scared off by realism.',
        ],
        bullets: [
          'Premium-material handling matters.',
          'Process discipline matters.',
          'Knowing when not to touch a pair matters too.',
        ],
      },
      {
        heading: 'How ShoeGlitch fits in',
        paragraphs: [
          'ShoeGlitch can sit between complete DIY and a totally solo business. The operator path gives skilled applicants a more credible route into restoration-adjacent opportunity while still respecting the craft.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is shoe restoration a good side hustle?',
        shortAnswer: 'It can be, if the operator treats it like precision work and not just cosmetic quick fixes.',
        answer:
          'Shoe restoration can be a strong side hustle when the operator is quality-first, understands material sensitivity, and knows the difference between preservation work and surface-level cleaning.',
      },
      {
        question: 'Does ShoeGlitch hire full restoration specialists from day one?',
        shortAnswer: 'Not automatically. The safer path is often growth from broader operator capability into higher-trust work.',
        answer:
          'Not automatically. The safer path is usually to prove broader operator capability first, then expand into higher-trust restoration work as skill and consistency are demonstrated.',
      },
      {
        question: 'What is the next step from this guide?',
        shortAnswer: 'Explore the operator system, then apply through the live operator application.',
        answer:
          'The next step from this guide is to explore the operator system and then use the existing operator application. The page exists to answer serious restoration-intent searches without pretending the opportunity is effortless.',
      },
    ],
    cta: {
      eyebrow: 'Restoration path',
      headline: 'If restoration is the goal, start with the operator path that can support it.',
      body: 'Use the operator system as the structured route into higher-trust sneaker work.',
      primaryHref: '/operator',
      primaryLabel: 'Review operator tiers',
      secondaryHref: '/operator/apply?tier=pro',
      secondaryLabel: 'Apply for Pro',
    },
    links: buildGuideLinks(cities),
    leadFields: [...leadFields],
    featuredCities: cities.slice(0, 6),
    role: 'restoration',
    earningsFrame:
      'Restoration should be framed as higher-trust, higher-skill work with slower qualification, not as a shortcut to easy money.',
  };
}
