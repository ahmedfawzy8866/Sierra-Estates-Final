import React from 'react';
import { createRoot } from 'react-dom/client';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Expo Router for web
import { ExpoRoot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

// Theme & Styles
import { ThemeProvider } from '../theme/ThemeProvider';
import './styles.css';

// Prevent splash screen from autohiding
SplashScreen.preventAutoHideAsync();

const RootLayout = require('../app/_layout').default;

function RootComponent() {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    // Hide splash screen when app is ready
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
      setIsReady(true);
    };
    hideSplash();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ExpoRoot>
            <RootLayout />
          </ExpoRoot>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Create root and render
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<RootComponent />);
}
