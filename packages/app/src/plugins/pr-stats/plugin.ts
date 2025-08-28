import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

export const prStatsPlugin = createPlugin({
  id: 'pr-stats',
  routes: {
    root: rootRouteRef,
  },
});

export const PRInsightsPage = prStatsPlugin.provide(
  createRoutableExtension({
    name: 'PRInsightsPage',
    component: () => import('../pr-stats/PRInsightsPage').then(m => m.PRInsightsPage),
    mountPoint: rootRouteRef,
  }),
);