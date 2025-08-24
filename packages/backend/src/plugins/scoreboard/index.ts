import { createBackendPlugin } from '@backstage/backend-plugin-api';
import { coreServices } from '@backstage/backend-plugin-api';
// Remove catalogServiceRef import
import { createRouter, RouterOptions } from './scoreboard';

export default createBackendPlugin({
  pluginId: 'scoreboard',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,  // NEW: For CatalogClient discovery
        auth: coreServices.auth,  // NEW: For generating tokens
      },
      async init({ httpRouter, logger, config, discovery, auth }) {
        logger.info('Initializing scoreboard plugin');

        const router = await createRouter({
          config,
          discovery,
          auth,
        } as unknown as RouterOptions);

        httpRouter.use(router);
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
        httpRouter.addAuthPolicy({
          path: '/entity-scores',
          allow: 'unauthenticated',
        });
      },
    });
  },
});