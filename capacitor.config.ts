import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kresimirnovak.slidepuzzle',
  appName: 'Slide Puzzle',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
