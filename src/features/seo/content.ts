import type { Metadata } from 'next';
import type { City, ServiceArea } from '@/types';
import { SITE_URL, getSeoServiceTemplate } from '@/features/seo/catalog';
import { getActiveSeoCities, getSeoCityBySlug, getSeoServiceAreasByCity } from '@/features/seo/data';
import {
  buildCityHubLinks,
  buildLocationsIndexLinks,
  buildServiceAreaLinks,
  buildServiceCityLinks,
  buildServiceHubLinks,
} from '@/features/seo/internal-links';
import { slugifyServiceArea } from '@/features/seo/routes';
import type {
  SeoLocationsIndexModel,
  SeoPageModel,
  SeoServiceHubModel,
  SeoServiceSlug,
} from '@/features/seo/types';

function locationLabel(cityName: string, state: string) {
  return `${cityName}, ${state}`;
}

function formatAreaList(areaNames: string[], cityName: string) {
  if (areaNames.length === 0) {
    return `Shoe Glitch supports ${cityName} through mail-in and expanding local coverage.`;
  }

  if (areaNames.length === 1) return areaNames[0];
  if (areaNames.length === 2) return `${areaNames[0]} and ${areaNames[1]}`;
  return `${areaNames.slice(0, 2).join(', ')}, and ${areaNames.length - 2} more service areas`;
}

function formatCityList(cities: City[]) {
  if (cities.length === 0) return 'current and expanding Shoe Glitch markets';
  if (cities.length === 1) return `${cities[0].name}, ${cities[0].state}`;
  if (cities.length === 2) return `${cities[0].name}, ${cities[0].state} and ${cities[1].name}, ${cities[1].state}`;
  return `${cities[0].name}, ${cities[0].state}, ${cities[1].name}, ${cities[1].state}, and ${cities.length - 2} more cities`;
}

function countServiceAreas(citiesWithAreas: Array<{ city: City; areas: ServiceArea[] }>) {
  return citiesWithAreas.reduce((sum, entry) => sum + entry.areas.length, 0);
}

function findAreaBySlug(serviceAreas: ServiceArea[], areaSlug: string) {
  return serviceAreas.find((area) => slugifyServiceArea(area.name) === areaSlug);
}

function buildServiceIntentCopy(serviceSlug: SeoServiceSlug) {
  if (serviceSlug === 'sneaker-cleaning') {
    return {
      promise:
        'Sneaker cleaning intent is about getting from dirty pair to booked order fast, with enough detail that the customer knows pickup, drop-off, or mail-in is real and can understand the difference between Basic, Pro, and Elite.',
      faq:
        'People searching for sneaker cleaning usually want a direct answer on service fit, coverage, whether the process goes deeper than a wipe-down, and the fastest way to start the order.',
      expectation:
        'The best sneaker-cleaning page explains what kind of pair fits the service, where Shoe Glitch is active, how Basic, Pro, and Elite differ, and which next action gets the pair into the workflow immediately.',
      examples: [
        'white leather or mesh pairs that show dirt quickly',
        'daily-wear sneakers that need a deep clean instead of replacement',
        'release-day pairs that need care before the grime sets in',
      ],
    };
  }

  if (serviceSlug === 'shoe-restoration') {
    return {
      promise:
        'Restoration intent is about deciding whether a pair is worth saving and what kind of Steam Clean, finish correction, and recovery work justifies the spend before booking.',
      faq:
        'Restoration searches come from people dealing with yellowing, sole issues, faded finish, or collector pairs that deserve more than a quick wipe-down.',
      expectation:
        'A strong restoration page needs to help a visitor decide whether the pair is a Basic, Pro, or Elite job, then guide them into the correct booking path with the right level of prep and recovery work.',
      examples: [
        'older collector pairs with visible sole or finish issues',
        'retro silhouettes where value and preservation matter',
        'pairs with repaint, whitening, or deeper restoration needs',
      ],
    };
  }

  return {
    promise:
      'Pickup and drop-off intent is about convenience and local coverage. The page has to tell visitors where the service is available and how to move into booking with less friction.',
    faq:
      'Pickup and drop-off searches are usually local logistics searches rather than broad service education searches.',
    expectation:
      'A useful pickup-and-drop-off page makes ZIP support, city availability, and the fallback mail-in path obvious before the visitor wastes time.',
    examples: [
      'local pickup where ZIP support is active',
      'drop-off handling in operator-supported markets',
      'mail-in fallback when local logistics are not the best fit',
    ],
  };
}

export async function buildServiceCityPageModel(
  serviceSlug: SeoServiceSlug,
  citySlug: string,
): Promise<SeoPageModel | undefined> {
  const [city, activeCities] = await Promise.all([getSeoCityBySlug(citySlug), getActiveSeoCities()]);
  if (!city) return undefined;

  const service = getSeoServiceTemplate(serviceSlug);
  const serviceAreas = await getSeoServiceAreasByCity(city.id);
  const areaNames = serviceAreas.map((area) => area.name);
  const cityLabel = locationLabel(city.name, city.state);
  const areaSummary = formatAreaList(areaNames, city.name);
  const servicePath = `/${service.slug}/${city.slug}`;
  const intent = buildServiceIntentCopy(service.slug);

  return {
    kind: 'service-city',
    path: servicePath,
    canonicalUrl: `${SITE_URL}${servicePath}`,
    title: `${service.name} in ${cityLabel} | Shoe Glitch`,
    description: `${service.name} in ${cityLabel}. ${service.summaryLine} Use Shoe Glitch to check coverage, compare services, and start your order.`,
    h1: `${service.name} in ${cityLabel}`,
    eyebrow: service.heroKicker,
    intro: `${intent.promise} Shoe Glitch supports ${service.cityIntentLabel} in ${cityLabel} with ${service.summaryLine}.`,
    quickAnswer: `${service.name} in ${cityLabel} works best when the page makes the next action obvious: verify coverage, choose the right service path, and book with intake details instead of relying on vague contact forms.`,
    summaryBullets: [
      `${service.name} is available for customers in ${cityLabel}.`,
      `Current market coverage includes ${areaSummary}.`,
      service.slug === 'sneaker-cleaning'
        ? 'Shoe Glitch now uses a three-tier menu: Basic, Pro, and Elite, with Steam Clean built into every tier.'
        : service.slug === 'shoe-restoration'
          ? 'Restoration routes move through the Elite-level recovery path, with Steam Clean, correction work, and higher-detail finish steps layered together.'
          : 'Use the coverage flow first so the local route stays clear before booking.',
      `Shoe Glitch supports booking through pickup, drop-off, or mail-in depending on the job and market.`,
      `The fastest next step is to check coverage and start an order with intake details.`,
    ],
    sections: [
      {
        heading: `What to expect from ${service.name.toLowerCase()} in ${city.name}`,
        paragraphs: [intent.faq, intent.expectation],
        bullets: [
          'Use the coverage flow before assuming pickup is active for every ZIP.',
          'Use intake notes and photos to make the quote or booking path cleaner.',
          'Choose the service path that matches the condition, not just the shoe name.',
        ],
      },
      {
        heading: `Coverage and service-area reality in ${city.name}`,
        paragraphs: [
          `This page is built around real city data, not inflated local claims. For ${cityLabel}, the current active service-area pattern is ${areaSummary}. That keeps the local guidance grounded in the coverage Shoe Glitch can actually support.`,
          `That matters for SEO and AEO because pages rank better when the local claim is real. It also matters for conversion because visitors can move into a ZIP check or booking flow with fewer surprises. For cleaning and restoration routes, it also lets Shoe Glitch explain when steam-assisted care is part of the service instead of pretending every tier works the same way.`,
        ],
      },
      {
        heading: `How Shoe Glitch turns search intent into a booked order`,
        paragraphs: [
          `The point of this page is not just to rank for ${service.name.toLowerCase()} in ${cityLabel}. The point is to give someone a useful answer, show the available path, and hand them into the real booking system without friction.`,
          `That is why the page links directly into booking, services, and coverage instead of acting like a dead-end article. Organic traffic should turn into orders or qualified leads, not just pageviews.`,
        ],
      },
    ],
    faqs: [
      {
        question: `Does Shoe Glitch offer ${service.name.toLowerCase()} in ${cityLabel}?`,
        shortAnswer: `Yes. Shoe Glitch supports ${service.name.toLowerCase()} in ${cityLabel} with city-aware booking and fulfillment options.`,
        answer: `Yes. Shoe Glitch supports ${service.name.toLowerCase()} in ${cityLabel}. Customers can use this page to check coverage, compare the right service path, and start an order with intake details instead of guessing what happens next.`,
      },
      {
        question: `How do I know whether pickup or drop-off is available in ${city.name}?`,
        shortAnswer: `Use the coverage checker first, because local availability depends on your service area and ZIP.`,
        answer: `Use the coverage checker first. Pickup and drop-off availability depends on the active service areas tied to ${city.name}. When local handling is not the best fit, Shoe Glitch still supports mail-in as a fallback path.`,
      },
      {
        question: `What should I send before booking ${service.name.toLowerCase()}?`,
        shortAnswer: `Start with the shoe type, condition notes, and clear intake photos.`,
        answer: `The most useful starting point is the shoe type, condition notes, and clear intake photos. That gives the team enough context to point you toward cleaning, restoration, or the right fulfillment path without unnecessary back-and-forth.`,
      },
      {
        question: `Why is this page useful when I am comparing local options?`,
        shortAnswer: `Because it gives a direct answer, city context, FAQs, structured headings, and schema tied to a real booking path.`,
        answer: `This page gives a direct answer, shows the local context, includes clear FAQs, and points you toward the next useful step. Instead of vague local copy, it connects this city and service to real booking and coverage paths.`,
      },
    ],
    cta: {
      eyebrow: 'Ready to book',
      headline: `Get ${service.shortName.toLowerCase()} started in ${city.name}`,
      body: `Check your coverage, compare the right service path, and move into booking with Shoe Glitch in ${cityLabel}.`,
      primaryHref: service.ctaPrimaryHref,
      primaryLabel: service.ctaPrimaryLabel,
      secondaryHref: service.ctaSecondaryHref,
      secondaryLabel: service.ctaSecondaryLabel,
    },
    links: buildServiceCityLinks(service, city, activeCities, serviceAreas),
    city,
    serviceAreas,
    service,
  };
}

export async function buildServiceAreaPageModel(
  serviceSlug: SeoServiceSlug,
  citySlug: string,
  areaSlug: string,
): Promise<SeoPageModel | undefined> {
  const [city, activeCities] = await Promise.all([getSeoCityBySlug(citySlug), getActiveSeoCities()]);
  if (!city) return undefined;

  const serviceAreas = await getSeoServiceAreasByCity(city.id);
  const area = findAreaBySlug(serviceAreas, areaSlug);
  if (!area) return undefined;

  const service = getSeoServiceTemplate(serviceSlug);
  const cityLabel = locationLabel(city.name, city.state);
  const path = `/${service.slug}/${city.slug}/${areaSlug}`;
  const intent = buildServiceIntentCopy(service.slug);
  const zipSummary = area.zips.length > 0 ? area.zips.slice(0, 4).join(', ') : 'coverage-led ZIP support';

  return {
    kind: 'service-area',
    path,
    canonicalUrl: `${SITE_URL}${path}`,
    title: `${service.name} in ${area.name}, ${city.name} | Shoe Glitch`,
    description: `${service.name} in ${area.name}, ${city.name}. Check local Shoe Glitch coverage, understand the service, and start your order with a city-aware booking path.`,
    h1: `${service.name} in ${area.name}, ${city.name}`,
    eyebrow: `${service.heroKicker} in ${area.name}`,
    intro: `${intent.promise} This service-area page focuses on ${area.name} inside ${cityLabel}, so visitors looking for a closer local answer can move into coverage and booking faster.`,
    quickAnswer: `${service.name} in ${area.name}, ${city.name} is the most specific local route for this service. It connects the service explanation, active area coverage, and the booking path so “near me” traffic has a real answer.`,
    summaryBullets: [
      `${area.name} is part of the live ${city.name} market coverage.`,
      area.zips.length > 0 ? `Common ZIPs tied to this service area include ${zipSummary}.` : `Use the coverage checker for ZIP-level confirmation in ${area.name}.`,
      service.slug === 'sneaker-cleaning'
        ? 'Basic, Pro, and Elite all start with Steam Clean, then layer in correction or restoration work depending on the pair.'
        : service.slug === 'shoe-restoration'
          ? 'Restoration routes layer Steam Clean prep into the work before finish corrections and recovery steps.'
          : 'Use the coverage checker for the exact handoff path before booking.',
      `${service.name} can route into pickup, drop-off, or mail-in depending on the job and local coverage.`,
      `The safest next step is to confirm your ZIP, then start the order with intake details.`,
    ],
    sections: [
      {
        heading: `What this ${area.name} page is for`,
        paragraphs: [
          `${area.name} gives Shoe Glitch a more precise local answer for ${service.name.toLowerCase()} than a broad city page alone. That matters when someone is searching for a nearby solution and wants to know whether their part of ${city.name} is actually supported.`,
          `This is still a conversion page, not a filler page. The content exists to connect local search traffic to a coverage check and a real booking flow.`,
        ],
      },
      {
        heading: `Coverage signals in ${area.name}`,
        paragraphs: [
          area.zips.length > 0
            ? `${area.name} currently maps to ZIP support like ${zipSummary}. The exact local fit still belongs in the coverage checker, but this page gives searchers a stronger local signal than a city-wide page alone.`
            : `${area.name} is an active service area in the ${city.name} market. Use the coverage checker for ZIP-level confirmation before booking pickup or drop-off.`,
          `Because this route is tied to a real service-area record, it stays aligned with actual operations instead of turning into a fake neighborhood SEO page.`,
        ],
      },
      {
        heading: `Best next step from ${area.name}`,
        paragraphs: [
          `Use the coverage checker if logistics are the main question. If service fit is the bigger question, compare services or move straight into booking with photos and notes so Shoe Glitch can route the pair correctly.`,
        ],
        bullets: [
          `Confirm ZIP support for ${area.name}.`,
          `Choose the right path between cleaning, restoration, and local handling.`,
          'Start the order with shoe details and intake notes.',
        ],
      },
    ],
    faqs: [
      {
        question: `Does Shoe Glitch serve ${area.name} in ${cityLabel}?`,
        shortAnswer: `Yes. ${area.name} is part of the active ${city.name} service footprint for Shoe Glitch.`,
        answer: `Yes. ${area.name} is part of the active ${city.name} service footprint. This page exists to turn a more specific local search into a real answer and a live booking path instead of forcing visitors through a generic city page.`,
      },
      {
        question: `How do I confirm my ZIP for ${area.name}?`,
        shortAnswer: `Use the coverage checker, because ZIP support is the final source of truth for pickup and drop-off.`,
        answer: `Use the coverage checker before booking. This page provides a service-area signal, but the ZIP-level checker is still the final source of truth for whether pickup or drop-off is available for your address.`,
      },
      {
        question: `Is this page better than the city page for “near me” searches?`,
        shortAnswer: `Yes. It gives a tighter local answer when the service area matters more than the city label alone.`,
        answer: `Yes. The city page is useful for the market overview, but this service-area page is a stronger match when someone is looking for a nearby answer inside the city. It narrows the local relevance and keeps the booking path visible.`,
      },
    ],
    cta: {
      eyebrow: 'Service-area booking',
      headline: `Book ${service.shortName.toLowerCase()} from ${area.name}`,
      body: `Use the coverage checker for ZIP confirmation, then move into booking with Shoe Glitch for ${area.name} and the wider ${city.name} market.`,
      primaryHref: '/coverage',
      primaryLabel: 'Check your coverage',
      secondaryHref: '/book',
      secondaryLabel: 'Start your order',
    },
    links: buildServiceAreaLinks(service, city, area, activeCities),
    city,
    serviceAreas: [area],
    service,
  };
}

export async function buildCityHubPageModel(citySlug: string): Promise<SeoPageModel | undefined> {
  const [city, activeCities] = await Promise.all([getSeoCityBySlug(citySlug), getActiveSeoCities()]);
  if (!city) return undefined;

  const serviceAreas = await getSeoServiceAreasByCity(city.id);
  const areaNames = serviceAreas.map((area) => area.name);
  const cityLabel = locationLabel(city.name, city.state);
  const path = `/locations/${city.slug}`;

  return {
    kind: 'city-hub',
    path,
    canonicalUrl: `${SITE_URL}${path}`,
    title: `Shoe cleaning and restoration in ${cityLabel} | Shoe Glitch`,
    description: `Shoe Glitch in ${cityLabel}. Explore local sneaker cleaning, shoe restoration, and pickup or drop-off options, then move into booking.`,
    h1: `Shoe care in ${cityLabel}`,
    eyebrow: 'City service page',
    intro: `Shoe Glitch supports customers in ${cityLabel} with a city-aware path into cleaning, restoration, and fulfillment. This page is the local hub for active service areas, service options, and booking paths.`,
    quickAnswer: `If you are looking for shoe cleaning or restoration in ${cityLabel}, start here. This page ties the real city coverage, service options, and booking routes together so you can choose the right next step faster.`,
    summaryBullets: [
      `Shoe Glitch is active in ${cityLabel}.`,
      areaNames.length > 0
        ? `Current service areas include ${formatAreaList(areaNames, city.name)}.`
        : `Mail-in support stays available even as local service-area coverage expands.`,
      `The main booking routes are cleaning, restoration, and pickup/drop-off logistics.`,
      `Use the coverage checker when you need ZIP-level confirmation.`,
    ],
    sections: [
      {
        heading: `What makes the ${city.name} page useful`,
        paragraphs: [
          `A local page should do more than repeat the city name. For ${cityLabel}, the page has to connect actual coverage, the live booking flow, and the services people are most likely to search for: sneaker cleaning, restoration, and pickup or drop-off logistics.`,
          `That combination makes the page useful for both SEO and AEO. Search engines can understand the local intent, and AI tools can extract a clear answer about what Shoe Glitch does in ${city.name} and where the visitor should go next. It also gives Shoe Glitch room to explain the real process, including how Basic, Pro, and Elite map to the work.`,
        ],
      },
      {
        heading: `How coverage works in ${city.name}`,
        paragraphs: [
          areaNames.length > 0
            ? `Current active service areas for ${city.name} include ${formatAreaList(areaNames, city.name)}. These areas are the best starting point for local pickup and drop-off expectations.`
            : `Local service-area coverage is still building in ${city.name}, so the safest next step is using the coverage checker or mail-in flow before assuming pickup availability.`,
          `Because the page is built from live city data, it can act as a stable local landing page without drifting away from the actual service footprint.`,
        ],
      },
      {
        heading: `Best next step for customers in ${city.name}`,
        paragraphs: [
          `If you already know what the pair needs, go straight to booking. If you are still deciding, compare services first, then use the coverage flow to confirm logistics. The page is built to shorten that path and turn local search traffic into a real order.`,
        ],
        bullets: [
          'Start with coverage if logistics are your main question.',
          'Use cleaning or restoration pages if service fit is the bigger question.',
          'Move into booking once you have the shoe details and location ready.',
        ],
      },
    ],
    faqs: [
      {
        question: `Does Shoe Glitch operate in ${cityLabel}?`,
        shortAnswer: `Yes. Shoe Glitch supports customers in ${cityLabel} through active local service areas and mail-in options.`,
        answer: `Yes. Shoe Glitch supports customers in ${cityLabel}. This city page exists to connect local search traffic to the real service, coverage, and booking flows instead of sending visitors into a generic national page.`,
      },
      {
        question: `How do I know if my ZIP is covered in ${city.name}?`,
        shortAnswer: `Use the coverage checker, because pickup and drop-off depend on active service areas and ZIP support.`,
        answer: `The best way to check your ZIP is the coverage checker. Local availability depends on active service areas and ZIP support inside the city. If pickup is not the best fit, mail-in remains an option.`,
      },
      {
        question: `What are the main services available in ${city.name}?`,
        shortAnswer: `The core local routes are sneaker cleaning, shoe restoration, and fulfillment options like pickup, drop-off, or mail-in.`,
        answer: `The main local routes are sneaker cleaning, shoe restoration, and the logistics around pickup, drop-off, or mail-in. Those service paths cover the main commercial intent Shoe Glitch is targeting city by city.`,
      },
    ],
    cta: {
      eyebrow: 'Start local',
      headline: `Book Shoe Glitch in ${city.name}`,
      body: `Move from city search to coverage check, service selection, and booking without guessing where to start.`,
      primaryHref: '/book',
      primaryLabel: 'Start your order',
      secondaryHref: '/coverage',
      secondaryLabel: 'Check your coverage',
    },
    links: buildCityHubLinks(city, activeCities),
    city,
    serviceAreas,
  };
}

export async function buildLocationsIndexPageModel(): Promise<SeoLocationsIndexModel> {
  const activeCities = await getActiveSeoCities();
  const citiesWithAreas = await Promise.all(
    activeCities.map(async (city) => ({
      city,
      areas: await getSeoServiceAreasByCity(city.id),
    })),
  );
  const areaCount = countServiceAreas(citiesWithAreas);

  return {
    kind: 'locations-index',
    path: '/locations',
    canonicalUrl: `${SITE_URL}/locations`,
    title: 'Shoe Glitch locations and service areas | Shoe Glitch',
    description: 'Explore every active Shoe Glitch city, service area, and booking path for sneaker cleaning, restoration, pickup, and drop-off.',
    h1: 'Shoe Glitch locations and service areas',
    eyebrow: 'City-by-city coverage',
    intro:
      'This is the central Shoe Glitch locations hub. It connects every active city, the real service footprint behind each market, and the fastest path into booking or coverage checking.',
    quickAnswer:
      'Use the locations hub when you need to know where Shoe Glitch is active, which city page to use, and how to move from a local search into the right booking path.',
    summaryBullets: [
      `Shoe Glitch is currently active in ${activeCities.length} cities.`,
      areaCount > 0 ? `Those markets currently map to ${areaCount} active service areas.` : 'Mail-in remains available while local service areas expand.',
      'Every city link points into a local SEO/AEO page with real booking and coverage actions.',
      'The goal is to turn local search intent into service orders, not just pageviews.',
    ],
    sections: [
      {
        heading: 'Why this locations page exists',
        paragraphs: [
          'A locations index gives Shoe Glitch a clean hub for local discovery. It helps people understand where the service is active before they dive into a city-specific page.',
          'This also reduces friction for customers who know the city but not yet the exact service they need. The locations page can route them into the right city hub, service hub, or booking path.',
        ],
      },
      {
        heading: 'How the city-by-city system works',
        paragraphs: [
          `Each live city gets a local hub and service-specific landing pages. Together, those routes target high-intent local queries like sneaker cleaning, shoe restoration, and pickup or drop-off in a way that stays tied to real operations.`,
          `The current active-city footprint includes ${formatCityList(activeCities)}. Those markets drive the first layer of scalable SEO and AEO coverage for Shoe Glitch.`,
        ],
      },
      {
        heading: 'Best next step from here',
        paragraphs: [
          'Choose your city if you already know where the pair should be handled. If you are still comparing options, use the service hubs or the coverage checker before you book.',
        ],
        bullets: [
          'Pick your city to see local service and coverage details.',
          'Use the coverage checker for ZIP-level pickup support.',
          'Move into booking once you know the city and service fit.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Which cities does Shoe Glitch currently serve?',
        shortAnswer: 'The locations hub lists every active Shoe Glitch city and links into the local landing page for each market.',
        answer: 'The locations hub lists every active Shoe Glitch city and links into the local landing page for each market. Those city pages are the best starting point for local sneaker cleaning, restoration, and pickup or drop-off intent.',
      },
      {
        question: 'Can I use this page to find local pickup and drop-off coverage?',
        shortAnswer: 'Yes. Start with your city, then use the coverage checker for ZIP-level confirmation.',
        answer: 'Yes. Use the locations page to choose the right city, then move into the coverage checker for ZIP-level confirmation. That gives you the clearest path from local discovery into booking.',
      },
      {
        question: 'Why is a locations hub good for SEO and AEO?',
        shortAnswer: 'Because it gives search engines and AI tools a clean map of live markets, related services, and local booking routes.',
        answer: 'A locations hub gives visitors a clear map of live markets, related services, and local booking routes. It also makes it easier to move between city pages, service pages, and the booking flow without getting lost.',
      },
    ],
    cta: {
      eyebrow: 'Ready to book',
      headline: 'Find your city, then start the order',
      body: 'Use the city links below to get to the right local page, or jump straight into coverage and booking if you already know what the pair needs.',
      primaryHref: '/coverage',
      primaryLabel: 'Check your coverage',
      secondaryHref: '/book',
      secondaryLabel: 'Start your order',
    },
    links: buildLocationsIndexLinks(activeCities),
    featuredCities: activeCities,
  };
}

export async function buildServiceHubPageModel(
  serviceSlug: SeoServiceSlug,
): Promise<SeoServiceHubModel> {
  const [activeCities, service] = await Promise.all([getActiveSeoCities(), Promise.resolve(getSeoServiceTemplate(serviceSlug))]);
  const cityList = activeCities.map((city) => `${city.name}, ${city.state}`);
  const intent = buildServiceIntentCopy(service.slug);

  return {
    kind: 'service-hub',
    path: `/${service.slug}`,
    canonicalUrl: `${SITE_URL}/${service.slug}`,
    title: `${service.name} | Shoe Glitch`,
    description: `${service.name} from Shoe Glitch. Understand the service, see supported cities, and move into booking with a clear next step.`,
    h1: `${service.name} with city-aware booking`,
    eyebrow: service.heroKicker,
    intro: `This is the Shoe Glitch hub for ${service.name.toLowerCase()}. It is built to rank for service-intent searches, answer common questions clearly, and move people into coverage and booking instead of leaving them on a dead informational page.`,
    quickAnswer: `${service.name} at Shoe Glitch is designed for customers who want the service explained clearly, supported markets called out, and a visible path into booking or coverage checking.`,
    summaryBullets: [
      `Shoe Glitch uses this hub to explain ${service.name.toLowerCase()} without hiding the booking path.`,
      `Supported city pages currently include ${cityList.slice(0, 3).join(', ')}${cityList.length > 3 ? `, and ${cityList.length - 3} more` : ''}.`,
      service.slug === 'sneaker-cleaning'
        ? 'The customer menu stays focused on Basic, Pro, and Elite, with Steam Clean built into every tier.'
        : service.slug === 'shoe-restoration'
          ? 'Restoration routes pair Steam Clean with finish correction and higher-recovery work.'
          : 'The route keeps coverage and booking logic clear before you move into the order.',
      `The page connects directly to booking, service comparison, and local market routes.`,
      `The goal is conversion-ready search traffic, not thin service copy.`,
    ],
    sections: [
      {
        heading: `What ${service.name.toLowerCase()} means at Shoe Glitch`,
        paragraphs: [
          intent.faq,
          `This hub page exists so visitors can understand what ${service.name.toLowerCase()} covers before choosing a city page, a coverage check, or the booking flow. For cleaning and restoration, that also means explaining how Basic, Pro, and Elite differ without turning the service menu into guesswork.`,
        ],
        bullets: intent.examples,
      },
      {
        heading: 'How this service page helps you move forward',
        paragraphs: [
          `The page is structured to answer the main question quickly, then point people into the next useful action. That is why the main booking or coverage step stays easy to find and why related city links are visible instead of buried in the footer.`,
          `For Shoe Glitch, this page should make the next move obvious: book, check local coverage, or compare services before you commit.`,
        ],
      },
      {
        heading: 'Where to go next',
        paragraphs: [
          `If you already know your city, use one of the local landing pages below. If you are still deciding whether the service fits the pair, compare services or start the booking flow with intake details so the next step is clear.`,
        ],
      },
    ],
    faqs: [
      {
        question: `What does Shoe Glitch include in ${service.name.toLowerCase()}?`,
        shortAnswer: `It includes a clear service explanation, city-aware routing, and a direct path into booking or coverage.`,
        answer: `Shoe Glitch uses this service hub to explain what ${service.name.toLowerCase()} covers, how it connects to local markets, and which next action makes the most sense: coverage, booking, or service comparison.`,
      },
      {
        question: `Which cities support ${service.name.toLowerCase()}?`,
        shortAnswer: `Use the linked city pages and coverage flow to see where the service is active right now.`,
        answer: `The active city pages listed here are the best starting point for ${service.name.toLowerCase()}. From there, visitors can move into city-specific landing pages and the live coverage flow instead of relying on generic national copy.`,
      },
      {
        question: 'Why does this page make booking easier?',
        shortAnswer: 'Because it answers the service question directly, links to live city pages, and keeps the booking path visible.',
        answer: 'This page makes booking easier because it answers the service question directly, links into city-specific routes, includes FAQ content, and keeps the next step visible instead of making you dig for it.',
      },
    ],
    cta: {
      eyebrow: 'Ready to move',
      headline: `Start ${service.shortName.toLowerCase()} with Shoe Glitch`,
      body: `Go straight into booking, or check your local coverage first if you need the city-specific path before you submit the pair.`,
      primaryHref: service.ctaPrimaryHref,
      primaryLabel: service.ctaPrimaryLabel,
      secondaryHref: service.ctaSecondaryHref,
      secondaryLabel: service.ctaSecondaryLabel,
    },
    links: buildServiceHubLinks(service, activeCities),
    service,
    featuredCities: activeCities,
  };
}

export async function buildServiceNearMePageModel(
  serviceSlug: SeoServiceSlug,
): Promise<SeoServiceHubModel> {
  const [activeCities, service] = await Promise.all([getActiveSeoCities(), Promise.resolve(getSeoServiceTemplate(serviceSlug))]);
  const citiesWithAreas = await Promise.all(
    activeCities.map(async (city) => ({
      city,
      areas: await getSeoServiceAreasByCity(city.id),
    })),
  );
  const areaCount = countServiceAreas(citiesWithAreas);

  return {
    kind: 'service-near-me',
    path: `/${service.slug}/near-me`,
    canonicalUrl: `${SITE_URL}/${service.slug}/near-me`,
    title: `${service.name} near me | Shoe Glitch`,
    description: `${service.name} near you with Shoe Glitch. Use city-aware coverage, service pages, and booking routes to find the best local path.`,
    h1: `${service.name} near you`,
    eyebrow: `${service.shortName} near me`,
    intro: `This page answers the “${service.name.toLowerCase()} near me” query without pretending Shoe Glitch is everywhere. It maps the search to live cities, real service areas, and the next booking step that makes sense.`,
    quickAnswer: `If you are searching for ${service.name.toLowerCase()} near you, start with the live Shoe Glitch cities and service areas below, then confirm ZIP support in coverage before you book.`,
    summaryBullets: [
      `The “near me” route is tied to ${activeCities.length} active Shoe Glitch cities.`,
      areaCount > 0 ? `Those cities currently map to ${areaCount} active service areas.` : 'Mail-in remains the fallback where local handling is still expanding.',
      service.slug === 'sneaker-cleaning'
        ? 'The cleaning route explains how Basic, Pro, and Elite differ without burying the booking path.'
        : service.slug === 'shoe-restoration'
          ? 'Restoration routes combine Steam Clean prep with the recovery work that follows.'
          : 'Use the nearest route to confirm local handling before you book.',
      `This page is built for local-intent searches, not generic national traffic.`,
      'The correct next move is to choose the nearest city page or run a ZIP coverage check.',
    ],
    sections: [
      {
        heading: `How Shoe Glitch answers “${service.name.toLowerCase()} near me”`,
        paragraphs: [
          `A strong “near me” page should do more than repeat location terms. It should translate local intent into real markets, real service areas, and a visible next step.`,
          `For Shoe Glitch, that means showing active cities, linking to city and service pages, and giving visitors a direct route into coverage or booking instead of trapping them in a generic landing page.`,
        ],
      },
      {
        heading: 'What to do next if you want the nearest route',
        paragraphs: [
          'Choose the city that best fits your market, then confirm your ZIP. If local pickup is not the right path, the same flow can still hand you into a mail-in option without losing the booking intent.',
        ],
        bullets: [
          'Pick the closest city page first.',
          'Use the coverage checker for ZIP-level pickup support.',
          'Move into booking once you know the city and service fit.',
        ],
      },
      {
        heading: 'Why this route matters for SEO and AEO',
        paragraphs: [
          '“Near me” searches are strong commercial-intent searches. This route explains how Shoe Glitch handles local discovery without inventing fake service coverage.',
          'Because the page ties directly into cities, service areas, booking, and coverage, it behaves like a real service page instead of filler copy.',
        ],
      },
    ],
    faqs: [
      {
        question: `Does Shoe Glitch offer ${service.name.toLowerCase()} near me?`,
        shortAnswer: `Shoe Glitch offers ${service.name.toLowerCase()} in active cities and service areas, and this page helps you find the closest supported path.`,
        answer: `Shoe Glitch offers ${service.name.toLowerCase()} in active cities and service areas. This page exists to help visitors searching “near me” find the nearest supported path, then move into coverage or booking.`,
      },
      {
        question: 'How do I know which Shoe Glitch city is closest to me?',
        shortAnswer: 'Use the city links below, then confirm your ZIP in the coverage checker.',
        answer: `The city links below are the fastest starting point. Choose the nearest live Shoe Glitch market, then use the coverage checker to confirm whether pickup or drop-off is available for your ZIP.`,
      },
      {
        question: 'Is this page better than a generic “near me” directory?',
        shortAnswer: 'Yes. It connects the local-intent query to real Shoe Glitch cities, service areas, and booking routes.',
        answer: 'Yes. This route is stronger than a generic directory because it connects the search query to real Shoe Glitch cities, service areas, and booking routes instead of showing broad, unsupported location claims.',
      },
    ],
    cta: {
      eyebrow: 'Find the right route',
      headline: `Book ${service.shortName.toLowerCase()} near you`,
      body: 'Choose your city, confirm your ZIP, and move from local-intent search into a real Shoe Glitch booking flow.',
      primaryHref: '/coverage',
      primaryLabel: 'Check your coverage',
      secondaryHref: '/book',
      secondaryLabel: 'Start your order',
    },
    links: buildServiceHubLinks(service, activeCities),
    service,
    featuredCities: activeCities,
  };
}

export function buildSeoMetadata(model: SeoPageModel): Metadata {
  return {
    title: model.title,
    description: model.description,
    alternates: {
      canonical: model.path,
    },
    openGraph: {
      title: model.title,
      description: model.description,
      url: model.canonicalUrl,
      type: 'website',
      siteName: 'Shoe Glitch',
    },
    twitter: {
      card: 'summary_large_image',
      title: model.title,
      description: model.description,
    },
  };
}

export function buildServiceHubMetadata(model: SeoServiceHubModel): Metadata {
  return {
    title: model.title,
    description: model.description,
    alternates: {
      canonical: model.path,
    },
    openGraph: {
      title: model.title,
      description: model.description,
      url: model.canonicalUrl,
      type: 'website',
      siteName: 'Shoe Glitch',
    },
    twitter: {
      card: 'summary_large_image',
      title: model.title,
      description: model.description,
    },
  };
}

export function buildLocationsIndexMetadata(model: SeoLocationsIndexModel): Metadata {
  return {
    title: model.title,
    description: model.description,
    alternates: {
      canonical: model.path,
    },
    openGraph: {
      title: model.title,
      description: model.description,
      url: model.canonicalUrl,
      type: 'website',
      siteName: 'Shoe Glitch',
    },
    twitter: {
      card: 'summary_large_image',
      title: model.title,
      description: model.description,
    },
  };
}
