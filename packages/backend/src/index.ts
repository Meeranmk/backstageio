/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */

import { createBackend } from '@backstage/backend-defaults';
import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  authProvidersExtensionPoint,
  createOAuthProviderFactory,
} from '@backstage/plugin-auth-node';
import { githubAuthenticator } from '@backstage/plugin-auth-backend-module-github-provider';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { versionScannerPlugin } from './plugins/versionScanner';
// import sonarqubePlugin from '@backstage-community/plugin-sonarqube-backend';
import 'dotenv/config';

const backend = createBackend();

backend.add(import('@backstage-community/plugin-sonarqube-backend'));
backend.add(import('@axis-backstage/plugin-jira-dashboard-backend'));
backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(import('@backstage/plugin-techdocs-backend'));
// backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
// See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
// See https://backstage.io/docs/auth/guest/provider
// backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);
backend.add(import('@backstage/plugin-scaffolder-backend-module-cookiecutter'));


// See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));
// See https://backstage.io/docs/permissions/getting-started for how to create your own permission policy
backend.add(
  import('@backstage/plugin-permission-backend-module-allow-all-policy'),
);

// search plugin
backend.add(import('@backstage/plugin-search-backend'));

// search engine
// See https://backstage.io/docs/features/search/search-engines
backend.add(import('@backstage/plugin-search-backend-module-pg'));

// search collators
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// kubernetes
backend.add(import('@backstage/plugin-kubernetes-backend'));

const customAuthResolver = createBackendModule({
  pluginId: 'auth',
  moduleId: 'github-auth-provider',
  register(reg) {
    reg.registerInit({
      deps: { providers: authProvidersExtensionPoint },
      async init({ providers }) {
        providers.registerProvider({
          providerId: 'github',
          factory: createOAuthProviderFactory({
            authenticator: githubAuthenticator,
            async signInResolver(info, ctx) {
              const { profile: { email } } = info;

              if (!email) {
                throw new Error('User profile contained no email');
              }

              const [userId] = email.split('@');
              const userEntity = stringifyEntityRef({
                kind: 'User',
                name: userId,
                namespace: 'default',
              });

              return ctx.issueToken({
                claims: {
                  sub: userEntity,
                  ent: [userEntity],
                },
              });
            },
          }),
        });
      },
    });
  },
});

backend.add(customAuthResolver);

backend.add(import('./plugins/scoreboard'));
backend.add(import('./plugins/confluence'));
backend.add(versionScannerPlugin);
 backend.add(import('@backstage-community/plugin-search-backend-module-confluence-collator'));
 backend.add(import('@backstage-community/plugin-copilot-backend'));
backend.start();
