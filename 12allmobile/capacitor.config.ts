import {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'hub.tv.m12all',
  appName: 'One2All HUB',
  bundledWebRuntime: false,
  webDir: 'build',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
