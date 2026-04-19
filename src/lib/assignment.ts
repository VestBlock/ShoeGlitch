import type { Cleaner, Order, ServiceCategory } from '@/types';
import { db } from '@/lib/db';

export interface AssignmentInput {
  cityId: string;
  serviceAreaId?: string;
  requiredSpecializations?: ServiceCategory[];
}

export interface CleanerSuggestion {
  cleaner: Cleaner;
  score: number;
  reasons: string[];
}

export async function suggestCleaners(input: AssignmentInput): Promise<CleanerSuggestion[]> {
  const candidates = await db.cleaners.byCity(input.cityId);
  return candidates
    .map((c) => {
      const reasons: string[] = [];
      let score = 0;

      if (input.serviceAreaId && c.serviceAreaIds.includes(input.serviceAreaId)) {
        score += 40;
        reasons.push('In service area');
      } else if (!input.serviceAreaId) {
        score += 10;
      }

      if (input.requiredSpecializations?.length) {
        const matched = input.requiredSpecializations.filter((s) =>
          c.specializations.includes(s),
        );
        if (matched.length === input.requiredSpecializations.length) {
          score += 30;
          reasons.push('Specialization match');
        } else if (matched.length > 0) {
          score += 10;
        }
      } else {
        score += 10;
      }

      score += Math.max(0, 20 - c.activeJobCount * 5);
      if (c.activeJobCount === 0) reasons.push('Available');

      score += Math.round(c.rating * 2);

      return { cleaner: c, score, reasons };
    })
    .sort((a, b) => b.score - a.score);
}

export async function requiredSpecializations(order: Order): Promise<ServiceCategory[]> {
  const cats = new Set<ServiceCategory>();
  for (const item of order.items) {
    const svc = await db.services.byId(item.serviceId);
    if (!svc) continue;
    if (svc.category !== 'addon') cats.add(svc.category);
  }
  return Array.from(cats);
}
