import {
  createServiceRef,
  createServiceFactory,
  coreServices,
} from '@backstage/backend-plugin-api';

/**
 * Backward-compatible tokenManager service for plugins that still depend on
 * the deprecated core.tokenManager service ref.
 *
 * Delegates to the new auth service to generate service-to-service tokens.
 */

interface TokenManagerService {
  getToken(): Promise<{ token: string }>;
}

const tokenManagerServiceRef = createServiceRef<TokenManagerService>({
  id: 'core.tokenManager',
  scope: 'plugin',
});

export const tokenManagerServiceFactory = createServiceFactory({
  service: tokenManagerServiceRef,
  deps: {
    auth: coreServices.auth,
  },
  async factory({ auth }) {
    return {
      async getToken() {
        const credentials = await auth.getOwnServiceCredentials();
        return auth.getPluginRequestToken({
          onBehalfOf: credentials,
          targetPluginId: 'catalog',
        });
      },
    };
  },
});
