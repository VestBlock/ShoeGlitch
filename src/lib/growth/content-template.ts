import type { GrowthPageContent, GrowthRouteSpec } from '@/lib/growth/types';

function titleCase(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function routeHeadline(spec: GrowthRouteSpec) {
  if (spec.kind === 'programmatic') {
    return `${spec.keyword!.keyword} in ${spec.location.city}, ${spec.location.state}`;
  }

  if (spec.kind === 'service-neighborhood') {
    return `${spec.service!.name} in ${spec.neighborhood!.name}, ${spec.location.city}`;
  }

  if (spec.kind === 'service-near-me') {
    return `${spec.service!.nearMeLabel}`;
  }

  return `${spec.service!.name} in ${spec.location.city}, ${spec.location.state}`;
}

function routeTopic(spec: GrowthRouteSpec) {
  if (spec.kind === 'programmatic') {
    return `${spec.keyword!.keyword} for people in ${spec.location.city}`;
  }

  if (spec.kind === 'service-neighborhood') {
    return `${spec.service!.name} for ${spec.neighborhood!.name} customers`;
  }

  if (spec.kind === 'service-near-me') {
    return `${spec.service!.name} near you`;
  }

  return `${spec.service!.name} in ${spec.location.city}`;
}

function localQualifier(spec: GrowthRouteSpec) {
  if (spec.neighborhood) {
    return `${spec.neighborhood.name}, ${spec.location.city}, ${spec.location.state}`;
  }
  if (spec.kind === 'service-near-me') {
    return `your local area with support from ${spec.location.city}, ${spec.location.state}`;
  }
  return `${spec.location.city}, ${spec.location.state}`;
}

export function buildTemplateContent(spec: GrowthRouteSpec): GrowthPageContent {
  const locationLabel = localQualifier(spec);
  const topic = routeTopic(spec);
  const h1 = routeHeadline(spec);
  const primaryOffer =
    spec.category?.commercialOffer ?? spec.service?.offer ?? 'free quote';
  const coreService = spec.category?.serviceName ?? spec.service?.name ?? titleCase(spec.primary);
  const keywordAngle = spec.keyword?.commercialAngle ?? `${coreService} with real tracking and clear next steps.`;
  const painPoint =
    spec.keyword?.problem ??
    `customers needing a dependable ${coreService.toLowerCase()} experience`;

  return {
    title: `${h1} | Shoe Glitch`,
    metaDescription: `${h1} from Shoe Glitch. ${keywordAngle} Get pickup, drop-off, or mail-in support, transparent pricing context, and a fast way to book.`,
    h1,
    intro: `${topic} should make the next step obvious. This page gives you a direct answer, a clear explanation of what to expect, and an easy way to book or request a quote with Shoe Glitch.`,
    quickAnswer: `${h1} is best handled by a service that can document condition, explain the process, and match the right cleaning or restoration approach to the pair. Shoe Glitch offers pickup, drop-off, and mail-in options, plus intake photo tracking so customers in ${locationLabel} can move from quote to completion without guesswork. The customer menu stays focused on Basic, Pro, and Elite so the next step is clear.`,
    longAnswer: `${h1} usually comes down to three things: the material, the condition, and how much finish work is needed after the cleaning itself. For customers in ${locationLabel}, the best outcome comes from starting with clear intake photos, choosing the right service level, and using a provider that can show progress instead of relying on vague updates. Shoe Glitch is built around that kind of visibility, which makes it easier to handle ${painPoint} while keeping the process simple for the customer. When the pair needs more than a quick exterior reset, Pro and Elite layer in the heavier correction and restoration work.`,
    summaryBullets: [
      `${h1} works best when the service matches the shoe material and level of wear.`,
      `Shoe Glitch supports pickup, drop-off, and mail-in options so booking is flexible.`,
      `Basic, Pro, and Elite keep the menu simple while still covering deeper care when the pair needs it.`,
      `Each order can include intake photos, status tracking, and direct follow-through from quote to return.`,
      `Customers in ${locationLabel} can use this page to compare options and move into a quote fast.`,
    ],
    sections: [
      {
        heading: `What people usually mean when they search for ${h1}`,
        paragraphs: [
          `Most people searching for ${h1} are not just looking for a generic vendor. They are usually trying to solve a specific visible problem like yellowed soles, stained uppers, flattened suede, or a pair that has lost the clean presentation it had when it was new. That is why pages targeting ${topic} have to answer the question directly instead of hiding the real outcome behind marketing language.`,
          `For Shoe Glitch, the goal is to make that decision faster. Customers in ${locationLabel} need to know what service fits the pair, what the first step looks like, and how quickly they can move from intake to completion. That combination of local clarity, direct answers, and a visible booking path is what turns search traffic into actual orders.`,
        ],
        bullets: [
          `Material condition matters more than brand hype.`,
          `The first best step is usually intake photos plus a service match.`,
          `Customers respond better when pickup, drop-off, and mail-in choices are obvious.`,
        ],
      },
      {
        heading: `How Shoe Glitch approaches ${coreService.toLowerCase()} in ${locationLabel}`,
        paragraphs: [
          `Shoe Glitch is designed to reduce friction around premium sneaker and shoe care. Instead of sending visitors into a dead-end contact page, the experience focuses on action: choose the service, confirm the location, upload intake photos, and move into booking. That workflow supports ${topic} because it turns an uncertain search into a tracked order. It also gives the page room to explain the real process, including how Basic, Pro, and Elite differ without overwhelming the customer.`,
          `This also improves conversion quality. Customers who understand what they are booking tend to provide better notes, better photos, and better expectations from the start. That matters when a pair needs cleaning, whitening, restoration, or careful material-specific handling, because the better the intake, the cleaner the handoff to the actual service workflow.`,
        ],
      },
      {
        heading: `What affects results, timing, and pricing`,
        paragraphs: [
          `Results depend on the material, the age of the issue, and how much finish work is needed after the first pass. A lightly worn pair can move through a standard cleaning path, while a pair with oxidation, deep staining, or layered damage may need restoration steps that take more time. That is why people searching for ${h1} often also want honest context about timing and pricing.`,
          `For local customers, the booking decision is easier when service tiers are named clearly and the route into a quote is immediate. For Shoe Glitch, that means pairing the content with a direct CTA, a form for lead capture, and enough structure that Google and AI tools can understand the answer. Better content quality supports both SEO traffic and AEO visibility, but it also keeps the lead quality higher because the page qualifies the visitor before they book.`,
        ],
        bullets: [
          `Condition and material usually drive the real service scope.`,
          `Restoration work often includes extra finish steps beyond cleaning.`,
          `Fast booking plus clear intake questions creates cleaner quotes.`,
        ],
      },
      {
        heading: `Why local and “near me” intent matters`,
        paragraphs: [
          `Searches like ${h1} often come with local purchase intent. Even when someone is open to mail-in service, they still want to know whether the brand is active nearby, whether pickup is available, and how quickly the order can move. Building pages for ${locationLabel} gives that visitor a better answer than a generic national service page ever could.`,
          `That local intent also improves how the page gets reused by AI systems. Clean answers, short summaries, FAQ blocks, and schema help large language models extract the important points quickly. When the page says who the service is for, where it is available, and what the next step is, it becomes easier for Google, ChatGPT, Perplexity, and similar systems to surface the page as a useful response.`,
        ],
      },
      {
        heading: `Best next step if you are ready to book`,
        paragraphs: [
          `If you already know the pair needs help, the fastest move is to request a quote or start the booking flow. For Shoe Glitch, that means picking the closest service path, choosing pickup, drop-off, or mail-in, and adding intake photos so the job can be scoped correctly. That creates a better customer experience and shortens the back-and-forth after the initial lead comes in.`,
          `If you are still comparing options, use this page as the starting point. Check service availability, review related guides, and use the lead form if you want help deciding. The point of the growth engine is not just to rank. It is to connect ${topic} with a page that answers the question well enough to create a real next action.`,
        ],
      },
    ],
    faqs: [
      {
        question: `How do I know if ${h1.toLowerCase()} is worth booking?`,
        shortAnswer: `It is usually worth booking when the pair has visible wear, staining, yellowing, or material damage that a home clean is unlikely to fix well.`,
        answer: `It is usually worth booking when the pair has visible wear, staining, yellowing, odor, or material issues that need a more careful approach than a quick wipe-down. For premium or sentimental pairs, professional intake, photo tracking, and material-specific care usually make the difference between a temporary improvement and a result that actually feels worth paying for.`,
      },
      {
        question: `Does Shoe Glitch offer pickup, drop-off, or mail-in service for ${locationLabel}?`,
        shortAnswer: `Shoe Glitch supports pickup, drop-off, or mail-in paths depending on the route and service area.`,
        answer: `Shoe Glitch is built around flexible fulfillment. Depending on the route and coverage area, customers can move forward with pickup, drop-off, or mail-in service. That flexibility matters because some visitors searching for ${h1.toLowerCase()} want something nearby, while others simply want the most reliable option regardless of distance.`,
      },
      {
        question: `What should I send before getting a quote?`,
        shortAnswer: `The best first step is sending clear intake photos, notes about the issue, and your location details.`,
        answer: `The most helpful quote request includes clear photos of the pair, a short note about the problem, and the city or ZIP where the service is needed. That gives the team enough context to recommend the right cleaning or restoration level without wasting time on follow-up questions.`,
      },
      {
        question: `Can this page help AI tools understand the service better?`,
        shortAnswer: `Yes. This page is structured with direct answers, summary bullets, FAQs, and schema so AI systems can extract clear information quickly.`,
        answer: `Yes. AI visibility improves when the page uses plain-language answers, scannable summaries, structured FAQs, and schema markup. That combination makes the content easier for search engines and answer engines to interpret, quote, and recommend.`,
      },
      {
        question: `What is the fastest way to move from reading to booking?`,
        shortAnswer: `Use the quote form or primary CTA, then add intake details so the job can be scoped immediately.`,
        answer: `The fastest move is to click the main CTA, choose the service path, and provide intake details right away. When customers add photos, notes, and location information upfront, the order can move through quote review and booking with much less friction.`,
      },
    ],
    cta: {
      eyebrow: 'Free next step',
      headline: `Get your ${primaryOffer} for ${locationLabel}`,
      body: `Use the form on this page to request help with ${topic}. Shoe Glitch will have enough context to point you toward the right booking path fast.`,
      offer: primaryOffer,
      primaryHref: '/book',
      primaryLabel: 'Start your order',
      secondaryHref: '/services',
      secondaryLabel: 'Compare services',
    },
    howToSteps: [
      {
        name: 'Choose the closest service path',
        text: `Pick the service route that best matches the pair and the condition problem you are trying to solve in ${locationLabel}.`,
      },
      {
        name: 'Upload intake details',
        text: 'Add photos, notes, and location details so the quote or booking path starts with enough context.',
      },
      {
        name: 'Confirm the fulfillment method',
        text: 'Choose pickup, drop-off, or mail-in so the order can move into the right workflow immediately.',
      },
      {
        name: 'Track progress through completion',
        text: 'Follow the order from intake to return instead of waiting on vague updates or disconnected follow-up.',
      },
    ],
  };
}
