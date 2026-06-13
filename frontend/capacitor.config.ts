import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.bazaarlens',
  appName: 'BazaarLens',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
};

export default config;
