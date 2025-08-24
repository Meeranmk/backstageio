// packages/app/src/plugins/scoreboard/plugin.ts

import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from "./routes"

export const scoreboardPlugin = createPlugin({
  id: 'scoreboard',
  routes: {
    root: rootRouteRef,
  },
});

export const ScoreboardPage = scoreboardPlugin.provide(
  createRoutableExtension({
    name: 'ScoreboardPage',
    component: () =>
      import('../../components/ScoreBoardPage/ScoreBoardPage').then(m => m.ScoreBoardPage),
    mountPoint: rootRouteRef,
  }),
);