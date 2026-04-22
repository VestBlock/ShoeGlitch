import { buildGrowthRouteIndex } from '@/lib/growth/catalog';
import { resolveGrowthContent } from '@/lib/growth/content-generator';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

function lexicalScore(query: string, candidate: string) {
  const queryTokens = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const candidateTokens = new Set(candidate.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
  return queryTokens.reduce((score, token) => score + (candidateTokens.has(token) ? 1 : 0), 0);
}

async function tryEmbeddedLookup(query: string) {
  if (!process.env.OPENAI_API_KEY) return [];

  try {
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) return [];
    const embeddingJson = await embeddingResponse.json();
    const queryEmbedding = embeddingJson.data?.[0]?.embedding;
    if (!queryEmbedding) return [];

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin.rpc('match_growth_content_chunks', {
      query_embedding: queryEmbedding,
      match_count: 4,
    });

    if (error || !data) return [];
    return data as Array<{ route_path: string; body: string; title: string }>;
  } catch {
    return [];
  }
}

export async function retrieveGrowthContext(query: string, routePath?: string) {
  const embeddedMatches = await tryEmbeddedLookup(query);
  if (embeddedMatches.length > 0) {
    return embeddedMatches.map((item) => ({
      routePath: item.route_path,
      title: item.title,
      excerpt: item.body,
    }));
  }

  const index = buildGrowthRouteIndex();

  const scored = await Promise.all(
    index.slice(0, 20).map(async (spec) => {
      const content = await resolveGrowthContent(spec);
      const score =
        lexicalScore(query, [spec.path, content.title, content.quickAnswer, content.longAnswer].join(' ')) +
        (routePath && spec.path === routePath ? 4 : 0);
      return { spec, content, score };
    }),
  );

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ spec, content }) => ({
      routePath: spec.path,
      title: content.title,
      excerpt: `${content.quickAnswer} ${content.summaryBullets.join(' ')}`,
    }));
}

export async function answerGrowthQuestion(query: string, routePath?: string) {
  const context = await retrieveGrowthContext(query, routePath);

  if (process.env.OPENAI_API_KEY && context.length > 0) {
    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_CHAT_MODEL ?? 'gpt-4.1-mini',
          input: [
            {
              role: 'system',
              content:
                'Answer as Shoe Glitch’s on-site conversion assistant. Use only the provided site context. Be concise, helpful, and push toward a clear next action when appropriate.',
            },
            {
              role: 'user',
              content: `Question: ${query}\n\nContext:\n${context
                .map((item) => `Source: ${item.routePath}\nTitle: ${item.title}\n${item.excerpt}`)
                .join('\n\n')}`,
            },
          ],
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const text = json.output?.[0]?.content?.[0]?.text;
        if (text) {
          return { answer: text, context };
        }
      }
    } catch {
      // Fall back to deterministic answer below.
    }
  }

  const top = context[0];
  return {
    answer: top
      ? `${top.excerpt} The fastest next step is to request a quote or start your order so the team can review the pair and recommend the right service.`
      : 'The fastest next step is to request a quote or start your order with Shoe Glitch so the team can review your pair and recommend the right service.',
    context,
  };
}
