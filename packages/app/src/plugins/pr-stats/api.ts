import { createApiRef } from '@backstage/core-plugin-api';

export interface PrStatsApi {
  getPrStats(): Promise<{ manual: number; copilot: number }>;
}

export const prStatsApiRef = createApiRef<PrStatsApi>({
  id: 'plugin.pr-stats.service',
});