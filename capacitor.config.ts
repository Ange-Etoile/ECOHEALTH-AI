import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.etoile.ecohealthai',
  appName: 'ECOHealth-AI',
  webDir: 'dist',
  plugins: {
    LiveUpdates: {
      appId: '715fd927', 
      channel: 'Production',
      autoUpdateMethod: 'background',
      maxVersions: 2
    }
  }
};

export default config;