import { buildTemplateContent } from '@/lib/growth/content-template';
import { fetchPersistedGrowthPage, savePersistedGrowthPage } from '@/lib/growth/persistence';
import type { GrowthPageContent, GrowthRouteSpec } from '@/lib/growth/types';

async function generateWithOpenAI(spec: GrowthRouteSpec): Promise<GrowthPageContent | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  const prompt = [
    'Return valid JSON only.',
    'You are generating SEO and AEO page content for a lead generation landing page.',
    `Route path: ${spec.path}`,
    `Route kind: ${spec.kind}`,
    `Category: ${spec.category?.slug ?? spec.service?.slug ?? spec.primary}`,
    `Keyword: ${spec.keyword?.keyword ?? spec.service?.name ?? spec.primary}`,
    `Location: ${spec.location.city}, ${spec.location.state}`,
    `Neighborhood: ${spec.neighborhood?.name ?? 'none'}`,
    `Intent: ${spec.intent}`,
    'Output keys: title, metaDescription, h1, intro, quickAnswer, longAnswer, summaryBullets, sections, faqs, cta, howToSteps.',
    'summaryBullets should be an array of 4 concise bullets.',
    'sections should be an array of 5 sections. Each section must contain heading, paragraphs (2 items minimum), and optional bullets.',
    'faqs should be an array of 5 objects with question, shortAnswer, answer.',
    'cta should contain eyebrow, headline, body, offer, primaryHref, primaryLabel, secondaryHref, secondaryLabel.',
    'howToSteps should be 4 clear steps with name and text.',
    'Keep the tone direct, conversion-focused, and easy for AI tools to quote.',
  ].join('\n');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_CONTENT_MODEL ?? 'gpt-4.1-mini',
      input: prompt,
      text: {
        format: {
          type: 'json_schema',
          name: 'growth_page',
          schema: {
            type: 'object',
            additionalProperties: false,
            required: [
              'title',
              'metaDescription',
              'h1',
              'intro',
              'quickAnswer',
              'longAnswer',
              'summaryBullets',
              'sections',
              'faqs',
              'cta',
              'howToSteps',
            ],
            properties: {
              title: { type: 'string' },
              metaDescription: { type: 'string' },
              h1: { type: 'string' },
              intro: { type: 'string' },
              quickAnswer: { type: 'string' },
              longAnswer: { type: 'string' },
              summaryBullets: {
                type: 'array',
                items: { type: 'string' },
              },
              sections: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['heading', 'paragraphs'],
                  properties: {
                    heading: { type: 'string' },
                    paragraphs: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                    bullets: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                  },
                },
              },
              faqs: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['question', 'shortAnswer', 'answer'],
                  properties: {
                    question: { type: 'string' },
                    shortAnswer: { type: 'string' },
                    answer: { type: 'string' },
                  },
                },
              },
              cta: {
                type: 'object',
                additionalProperties: false,
                required: [
                  'eyebrow',
                  'headline',
                  'body',
                  'offer',
                  'primaryHref',
                  'primaryLabel',
                  'secondaryHref',
                  'secondaryLabel',
                ],
                properties: {
                  eyebrow: { type: 'string' },
                  headline: { type: 'string' },
                  body: { type: 'string' },
                  offer: { type: 'string' },
                  primaryHref: { type: 'string' },
                  primaryLabel: { type: 'string' },
                  secondaryHref: { type: 'string' },
                  secondaryLabel: { type: 'string' },
                },
              },
              howToSteps: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['name', 'text'],
                  properties: {
                    name: { type: 'string' },
                    text: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    }),
  });

  if (!response.ok) return null;
  const json = await response.json();
  const text = json.output?.[0]?.content?.[0]?.text;
  if (!text) return null;

  try {
    return JSON.parse(text) as GrowthPageContent;
  } catch {
    return null;
  }
}

export async function resolveGrowthContent(
  spec: GrowthRouteSpec,
  options?: { persist?: boolean; preferLiveGeneration?: boolean },
) {
  const persisted = await fetchPersistedGrowthPage(spec.path);
  if (persisted?.payload) {
    return persisted.payload;
  }

  const generated =
    options?.preferLiveGeneration || process.env.GROWTH_USE_OPENAI === 'true'
      ? await generateWithOpenAI(spec)
      : null;

  const payload = generated ?? buildTemplateContent(spec);

  if (options?.persist) {
    await savePersistedGrowthPage(spec, payload);
  }

  return payload;
}
