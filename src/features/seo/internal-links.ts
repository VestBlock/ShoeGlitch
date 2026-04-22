import type { City, ServiceArea } from '@/types';
import { listSeoServiceTemplates } from '@/features/seo/catalog';
import type { SeoLinkSuggestion, SeoServiceTemplate } from '@/features/seo/types';
import { slugifyServiceArea } from '@/features/seo/routes';

export function buildServiceCityLinks(
  service: SeoServiceTemplate,
  city: City,
  activeCities: City[],
  serviceAreas: ServiceArea[],
): SeoLinkSuggestion[] {
  const sameCityServiceLinks = listSeoServiceTemplates()
    .filter((item) => item.slug !== service.slug)
    .map((item) => ({
      href: `/${item.slug}/${city.slug}`,
      label: `${item.name} in ${city.name}`,
      description: `Related local service for the same city.`,
    }));

  const otherCityLinks = activeCities
    .filter((item) => item.slug !== city.slug)
    .slice(0, 2)
    .map((item) => ({
      href: `/${service.slug}/${item.slug}`,
      label: `${service.name} in ${item.name}`,
      description: `Same service in another active ShoeGlitch market.`,
    }));

  const areaLinks = serviceAreas.slice(0, 2).map((area) => ({
    href: `/${service.slug}/${city.slug}/${slugifyServiceArea(area.name)}`,
    label: `${service.name} in ${area.name}`,
    description: `Service-area page for ${area.name}.`,
  }));

  return [
    {
      href: '/book',
      label: 'Start your order',
      description: 'Move from search to booking immediately.',
    },
    {
      href: '/coverage',
      label: 'Check your coverage',
      description: 'Verify pickup and drop-off availability before you book.',
    },
    {
      href: `/locations/${city.slug}`,
      label: `${city.name} city page`,
      description: 'See the local service overview and active market details.',
    },
    {
      href: `/${service.slug}/near-me`,
      label: `${service.name} near me`,
      description: 'See the city-aware “near me” page for this service.',
    },
    {
      href: `/operator-opportunities/${city.slug}`,
      label: `Become an operator in ${city.name}`,
      description: 'City-specific operator recruitment page for this market.',
    },
    ...areaLinks,
    ...sameCityServiceLinks,
    ...otherCityLinks,
  ].slice(0, 8);
}

export function buildCityHubLinks(city: City, activeCities: City[]): SeoLinkSuggestion[] {
  const serviceLinks = listSeoServiceTemplates().map((service) => ({
    href: `/${service.slug}/${city.slug}`,
    label: `${service.name} in ${city.name}`,
    description: `Service-specific landing page for ${city.name}.`,
  }));

  const nearbyCityLinks = activeCities
    .filter((item) => item.slug !== city.slug)
    .slice(0, 2)
    .map((item) => ({
      href: `/locations/${item.slug}`,
      label: `${item.name} location page`,
      description: `Compare another live market.`,
    }));

  return [
    {
      href: '/book',
      label: 'Start your order',
      description: 'Book pickup, drop-off, or mail-in service.',
    },
    {
      href: '/services',
      label: 'Compare services',
      description: 'Review cleaning, restoration, and add-on options.',
    },
    {
      href: '/coverage',
      label: 'Check your ZIP',
      description: 'See whether local pickup is available.',
    },
    {
      href: '/locations',
      label: 'All live cities',
      description: 'See every active Shoe Glitch market and city hub.',
    },
    {
      href: `/operator-opportunities/${city.slug}`,
      label: `Operate in ${city.name}`,
      description: 'Operator recruitment page for this city.',
    },
    ...serviceLinks,
    ...nearbyCityLinks,
  ].slice(0, 8);
}

export function buildServiceHubLinks(service: SeoServiceTemplate, activeCities: City[]): SeoLinkSuggestion[] {
  const cityLinks = activeCities.slice(0, 4).map((city) => ({
    href: `/${service.slug}/${city.slug}`,
    label: `${service.name} in ${city.name}`,
    description: `City-specific ${service.shortName.toLowerCase()} landing page.`,
  }));

  const siblingServiceLinks = listSeoServiceTemplates()
    .filter((item) => item.slug !== service.slug)
    .slice(0, 2)
    .map((item) => ({
      href: `/${item.slug}`,
      label: `${item.name} hub`,
      description: `Related Shoe Glitch service hub for broader intent.`,
    }));

  return [
    {
      href: '/book',
      label: 'Start your order',
      description: 'Move from search into the live booking flow.',
    },
    {
      href: '/coverage',
      label: 'Check your coverage',
      description: 'Verify city and ZIP support before you book.',
    },
    {
      href: '/services',
      label: 'Compare services',
      description: 'See how cleaning, restoration, and fulfillment differ.',
    },
    {
      href: `/${service.slug}/near-me`,
      label: `${service.name} near me`,
      description: 'Search-intent version of the service for local booking queries.',
    },
    {
      href: '/become-an-operator',
      label: 'Become a ShoeGlitch operator',
      description: 'Operator acquisition landing page tied to real cities and services.',
    },
    ...cityLinks,
    ...siblingServiceLinks,
  ].slice(0, 8);
}

export function buildServiceAreaLinks(
  service: SeoServiceTemplate,
  city: City,
  area: ServiceArea,
  activeCities: City[],
): SeoLinkSuggestion[] {
  const siblingServices = listSeoServiceTemplates()
    .filter((item) => item.slug !== service.slug)
    .map((item) => ({
      href: `/${item.slug}/${city.slug}`,
      label: `${item.name} in ${city.name}`,
      description: `Same city, different Shoe Glitch service.`,
    }));

  const nearbyCities = activeCities
    .filter((item) => item.slug !== city.slug)
    .slice(0, 2)
    .map((item) => ({
      href: `/${service.slug}/${item.slug}`,
      label: `${service.name} in ${item.name}`,
      description: 'Related city page for the same service.',
    }));

  return [
    {
      href: '/book',
      label: 'Start your order',
      description: 'Move straight into booking with intake details.',
    },
    {
      href: '/coverage',
      label: 'Check your coverage',
      description: 'Confirm ZIP support before booking pickup or drop-off.',
    },
    {
      href: `/${service.slug}/${city.slug}`,
      label: `${service.name} in ${city.name}`,
      description: `Back out to the city-level landing page for ${city.name}.`,
    },
    {
      href: `/locations/${city.slug}`,
      label: `${city.name} city page`,
      description: `See the broader city coverage around ${area.name}.`,
    },
    {
      href: `/operator-opportunities/${city.slug}`,
      label: `Operate in ${city.name}`,
      description: 'Operator recruitment page for the same city.',
    },
    ...siblingServices,
    ...nearbyCities,
  ].slice(0, 8);
}

export function buildLocationsIndexLinks(activeCities: City[]): SeoLinkSuggestion[] {
  const cityLinks = activeCities.slice(0, 4).map((city) => ({
    href: `/locations/${city.slug}`,
    label: `${city.name} location page`,
    description: `See local sneaker cleaning, restoration, and coverage in ${city.name}.`,
  }));

  const serviceLinks = listSeoServiceTemplates().map((service) => ({
    href: `/${service.slug}`,
    label: `${service.name} hub`,
    description: `Explore the Shoe Glitch ${service.shortName.toLowerCase()} hub.`,
  }));

  return [
    {
      href: '/coverage',
      label: 'Check your ZIP',
      description: 'See whether pickup or drop-off is active for your area.',
    },
    {
      href: '/book',
      label: 'Start your order',
      description: 'Move into the booking flow once you know your city.',
    },
    {
      href: '/operators',
      label: 'Operator opportunities',
      description: 'Explore Shoe Glitch operator pages and city launch opportunities.',
    },
    ...cityLinks,
    ...serviceLinks,
  ].slice(0, 10);
}
