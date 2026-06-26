// app/_layout.tsx
import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { runMigrations } from '../src/data/database/migrations';
import { palette } from '../src/ui/theme';

export default function RootLayout() {
  useEffect(() => {
    runMigrations();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.black }}>
      <StatusBar style="light" backgroundColor={palette.black} />
      <Slot />
    </GestureHandlerRootView>
  );
}