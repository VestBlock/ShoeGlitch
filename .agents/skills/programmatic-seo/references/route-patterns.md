# Programmatic Route Patterns

## Preferred pattern
- `catalog.ts`: route definitions or template map
- `content.ts`: page-model builder
- `schema.ts`: JSON-LD builder
- `links.ts`: internal-link suggestions
- route file: thin wrapper only

## Good ShoeGlitch examples
- service-city: `/sneaker-cleaning/milwaukee`
- service-city: `/shoe-restoration/memphis`
- city hub: `/locations/atlanta`

## Route-file checklist
- `generateStaticParams`
- `generateMetadata`
- main page that calls shared content builder
- `notFound()` for invalid params
- sensible `revalidate`
