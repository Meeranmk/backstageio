import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const codeScannerPlugin = createPlugin({
  id: 'code-scanner',
  routes: {
    root: rootRouteRef,
  },
});

// export const CodeScannerPage = codeScannerPlugin.provide(
//   createRoutableExtension({
//     name: 'CodeScannerPage',
//     component: () =>
//       import('./components/ExampleComponent').then(m => m.ExampleComponent),
//     mountPoint: rootRouteRef,
//   }),
// );

export const CodeScannerPage = codeScannerPlugin.provide(
  createRoutableExtension({
    name: 'CodeScannerPage',
    component: () =>
      import('../../components/VersionScannerPluginpage/VersionScannerPluginpage').then(
        m => m.VersionScannerPluginpage,
      ),
    mountPoint: rootRouteRef,
  }),
);