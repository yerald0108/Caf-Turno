// app/turno/_layout.tsx
import { Stack } from 'expo-router';
import { palette } from '../../src/ui/theme';

export default function TurnoLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.surface0 },
        animation: 'slide_from_bottom',
      }}
    />
  );
}