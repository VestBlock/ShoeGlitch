import { buildMonitorHealth, fetchMonitorPage } from '@/features/intelligence/monitors/helpers';
import type { RetailMonitorSource } from '@/features/intelligence/monitors/types';

export function createBlockedAwareSource(input: {
  key: string;
  label: string;
  sourceUrl: string;
}) : RetailMonitorSource {
  return {
    key: input.key,
    label: input.label,
    sourceUrl: input.sourceUrl,

    async collect(now) {
      try {
        const { response } = await fetchMonitorPage(input.sourceUrl);
        const healthy = response.ok;
        return {
          entries: [],
          health: buildMonitorHealth({
            key: input.key,
            label: input.label,
            status: healthy ? 'healthy' : 'degraded',
            message: healthy
              ? `${input.label} responded, but a dedicated parser is not enabled yet.`
              : `${input.label} is blocking server fetches right now (${response.status}).`,
            sourceUrl: input.sourceUrl,
            httpStatus: response.status,
            lastSuccessAt: healthy ? now.toISOString() : undefined,
          }),
        };
      } catch (error) {
        return {
          entries: [],
          health: buildMonitorHealth({
            key: input.key,
            label: input.label,
            status: 'degraded',
            message: error instanceof Error ? error.message : `${input.label} monitor failed.`,
            sourceUrl: input.sourceUrl,
          }),
        };
      }
    },
  };
}

