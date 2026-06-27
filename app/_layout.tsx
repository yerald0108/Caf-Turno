// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { runMigrations } from '../src/data/database/migrations';
import { palette } from '../src/ui/theme';
import { SplashOverlay } from '../src/ui/components/common/SplashOverlay';

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    runMigrations();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.black }}>
      <StatusBar style="light" backgroundColor={palette.black} />
      <Slot />
      {showSplash && (
        <SplashOverlay onFinish={() => setShowSplash(false)} />
      )}
    </GestureHandlerRootView>
  );
}