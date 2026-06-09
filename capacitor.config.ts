import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.lunker.app",
  appName: "LUNKER",
  webDir: "out",
  server: {
    url: "https://lunker-app-omega.vercel.app",
    cleartext: false,
  },
  android: {
    backgroundColor: "#131313",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
