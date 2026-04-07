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
    },
    SplashScreen: {
      launchShowDuration: 5000, 
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#00C9A7",
      androidSplashResourceName: "splash", 
      splashFullScreen: true,             
      splashImmersive: true               
    }
  }
};

export default config;
