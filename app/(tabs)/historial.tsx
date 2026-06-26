// app/(tabs)/historial.tsx
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, fontSize, spacing } from '../../src/ui/theme';

export default function HistorialScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.text}>Pantalla de Historial</Text>
        <Text style={styles.sub}>Fase 5 la construye</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.surface0 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  text: { fontSize: fontSize.lg, fontWeight: '700', color: palette.textPrimary },
  sub: { fontSize: fontSize.sm, color: palette.textSecondary },
});