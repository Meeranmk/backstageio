// packages/backend/src/plugins/confluence/index.ts
import { createBackendPlugin } from '@backstage/backend-plugin-api';
import { coreServices } from '@backstage/backend-plugin-api';
import { createRouter } from './confluence';

export default createBackendPlugin({
  pluginId: 'confluence',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      async init({ httpRouter, logger, config }) {
        logger.info('Initializing Confluence plugin');
        
        const router = await createRouter({ config });
        
        httpRouter.use(router);
        httpRouter.addAuthPolicy({
          path: '/content',
          allow: 'unauthenticated',
        });
        logger.info('Added auth policy for /content to allow unauthenticated access');
      },
    });
  },
});