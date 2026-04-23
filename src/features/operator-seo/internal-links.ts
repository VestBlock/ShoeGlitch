import type { City } from '@/types';
import type { OperatorSeoLinkSuggestion } from '@/features/operator-seo/types';

export function buildOperatorHubLinks(cities: City[]): OperatorSeoLinkSuggestion[] {
  const cityLinks = cities.slice(0, 3).map((city) => ({
    href: `/operator-opportunities/${city.slug}`,
    label: `Operate in ${city.name}`,
    description: `See the operator opportunity and city launch angle for ${city.name}.`,
  }));

  return [
    {
      href: '/operator/apply?tier=starter',
      label: 'Apply now',
      description: 'Move into the live operator application flow.',
    },
    {
      href: '/operator',
      label: 'Operator kit overview',
      description: 'See tiers, training, and what Shoe Glitch already offers operators.',
    },
    {
      href: '/start-a-sneaker-cleaning-business',
      label: 'Start a sneaker cleaning business',
      description: 'Learn how Shoe Glitch turns side-hustle intent into territory-ready work.',
    },
    ...cityLinks,
  ].slice(0, 7);
}

export function buildOperatorCityLinks(city: City, cities: City[]): OperatorSeoLinkSuggestion[] {
  const nearby = cities
    .filter((entry) => entry.slug !== city.slug)
    .slice(0, 2)
    .map((entry) => ({
      href: `/operator-opportunities/${entry.slug}`,
      label: `Operator opportunity in ${entry.name}`,
      description: 'Compare another live or opening Shoe Glitch market.',
    }));

  return [
    {
      href: `/operator/apply?tier=starter&city=${city.slug}`,
      label: `Apply in ${city.name}`,
      description: 'Use the live operator application with this city preselected.',
    },
    {
      href: `/pickup-dropoff-operator/${city.slug}`,
      label: `${city.name} pickup role`,
      description: `See the pickup and drop-off version of the ${city.name} operator opportunity.`,
    },
    {
      href: `/locations/${city.slug}`,
      label: `${city.name} service market`,
      description: 'See how Shoe Glitch already presents the city on the customer side.',
    },
    {
      href: `/sneaker-cleaning/${city.slug}`,
      label: `Sneaker cleaning in ${city.name}`,
      description: 'Customer-intent page for the same market.',
    },
    ...nearby,
  ].slice(0, 7);
}

export function buildPickupOperatorLinks(cities: City[], city: City): OperatorSeoLinkSuggestion[] {
  const nearby = cities
    .filter((entry) => entry.slug !== city.slug)
    .slice(0, 2)
    .map((entry) => ({
      href: `/pickup-dropoff-operator/${entry.slug}`,
      label: `Pickup operator in ${entry.name}`,
      description: 'See another city-specific local logistics opportunity.',
    }));

  return [
    {
      href: `/operator/apply?tier=starter&city=${city.slug}&focus=pickup-dropoff`,
      label: `Apply for ${city.name} routes`,
      description: 'Move into the live application flow with city context.',
    },
    {
      href: `/operator-opportunities/${city.slug}`,
      label: `${city.name} operator overview`,
      description: 'See the broader operator opportunity for this city.',
    },
    {
      href: `/pickup-dropoff/${city.slug}`,
      label: `${city.name} pickup & drop-off service page`,
      description: 'Customer-intent page that shows the local logistics demand angle.',
    },
    ...nearby,
  ].slice(0, 7);
}

export function buildGuideLinks(cities: City[]): OperatorSeoLinkSuggestion[] {
  const cityLinks = cities.slice(0, 2).map((city) => ({
    href: `/operator-opportunities/${city.slug}`,
    label: `Become an operator in ${city.name}`,
    description: `Local operator-acquisition page for ${city.name}.`,
  }));

  return [
    {
      href: '/become-an-operator',
      label: 'Become a ShoeGlitch operator',
      description: 'Main operator acquisition landing page.',
    },
    {
      href: '/operator/apply?tier=starter',
      label: 'Start your application',
      description: 'Use the existing live operator application flow.',
    },
    {
      href: '/operator',
      label: 'See operator kits',
      description: 'Review the current Basic, Pro, and Luxury operator paths.',
    },
    ...cityLinks,
  ].slice(0, 7);
}
