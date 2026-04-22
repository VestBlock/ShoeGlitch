#!/usr/bin/env tsx

async function checkRoute(url: string) {
  const response = await fetch(url);
  const html = await response.text();

  const checks = {
    ok: response.ok,
    title: /<title>.*<\/title>/i.test(html),
    description: /<meta[^>]+name="description"/i.test(html),
    h1: /<h1[\s>]/i.test(html),
    faq: /Frequently asked questions|FAQ/i.test(html),
    schema: /application\/ld\+json/i.test(html),
    cta: /Start your order|Check your coverage|Compare services/i.test(html),
  };

  return { url, status: response.status, checks };
}

async function main() {
  const routes = process.argv.slice(2);

  if (routes.length === 0) {
    console.error('Usage: tsx check-seo-routes.ts http://localhost:3000/sneaker-cleaning/milwaukee');
    process.exit(1);
  }

  const results = await Promise.all(routes.map(checkRoute));
  for (const result of results) {
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
