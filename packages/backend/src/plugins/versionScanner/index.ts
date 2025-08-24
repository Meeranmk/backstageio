import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
// import { CatalogClient } from '@backstage/catalog-client';

import { createRouter } from "./router" // Import from router.ts
import { VersionScannerService } from './versionScanner';
import { UpgradeMetricsService } from "./upgradeMetricsService"



// This file defines and exports the plugin.
export const versionScannerPlugin = createBackendPlugin({
  pluginId: 'version-scanner',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        httpRouter: coreServices.httpRouter,
        // database: databaseManagerRef,        // discovery: coreServices.discovery,
        // scheduler: coreServices.scheduler,

      },
      async init({ logger, config, httpRouter}) {
        logger.info('✅✅✅ Initializing version-scanner plugin... ✅✅✅');
        // const catalogApi = new CatalogClient({ discoveryApi: discovery });
        
        const versionScannerService = new VersionScannerService(logger, config);
        const upgradeMetricsService = new UpgradeMetricsService(logger, config);
        
        
        const expressRouter = await createRouter({
          logger,
          versionScannerService,
          upgradeMetricsService,

        });

        httpRouter.use(expressRouter);
        // const taskRunner = new TaskRunner(logger, config, tempCatalogApi, knex);
        // await scheduler.scheduleTask({
        //   id: 'scan_github_repositories_daily',
        //   frequency: { days: 1 }, // Runs once a day
        //   timeout: { minutes: 15 },
        //   initialDelay: { seconds: 30 }, // Run 30 seconds after startup
        //   fn: async () => {
        //     await taskRunner.run();
        //   },
        // });

        httpRouter.addAuthPolicy({ path: '/health', allow: 'unauthenticated' });
        httpRouter.addAuthPolicy({ path: '/version-info', allow: 'unauthenticated' });
        httpRouter.addAuthPolicy({ path: '/project-analysis', allow: 'unauthenticated' });
        httpRouter.addAuthPolicy({ path: '/upgrade-metrics', allow: 'unauthenticated' });
        // httpRouter.addAuthPolicy({ path: '/submit-feedback', allow: 'unauthenticated' });

      },
    });
  },
});