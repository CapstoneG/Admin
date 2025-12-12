export const config = {
  api: {
    baseUrl: 'http://localhost:8080',
  },
  app: {
    name: 'Enghub',
    version: '1.0.0',
  },
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

export const { api, app, isDevelopment, isProduction } = config;
export const { baseUrl: API_BASE_URL } = api;
export const { name: APP_NAME, version: APP_VERSION } = app;

export default config;