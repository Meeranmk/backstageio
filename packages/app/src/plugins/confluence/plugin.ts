import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes'

export const confluencePlugin = createPlugin({
  id: 'confluence',
  routes: {
    root: rootRouteRef,
  },
});

export const ConfluencePage = confluencePlugin.provide(
  createRoutableExtension({
    name: 'ConfluencePage',
    component: () =>
      import('../../components/ConfluencePage/ConfluencePage').then(m => m.ConfluencePage),
    mountPoint: rootRouteRef,
  }),
);