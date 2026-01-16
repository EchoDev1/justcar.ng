import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ng.justcars.app',
  appName: 'JustCars',
  webDir: 'out',

  server: {
    // For development: point to local dev server
    // Comment out for production builds
    // url: 'http://localhost:3000',
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: false
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: '#1e40af', // Blue-800
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerStyle: 'small',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true
    },

    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },

    Camera: {
      // Camera plugin settings
    },

    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1e40af'
    },

    App: {
      // Deep linking configuration
    },

    Haptics: {
      // Haptics configuration
    }
  },

  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false, // Set true for development
    backgroundColor: '#1e40af',
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK'
    }
  },

  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'JustCars',
    backgroundColor: '#1e40af',
    scrollEnabled: true
  }
};

export default config;
