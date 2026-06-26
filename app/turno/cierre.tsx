// app/turno/cierre.tsx
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, fontSize } from '../../src/ui/theme';

export default function CierreScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.text}>Cierre de turno</Text>
        <Text style={styles.sub}>Se construye en Fase 7</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.surface0 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  text: { fontSize: fontSize.lg, fontWeight: '700', color: palette.textPrimary },
  sub: { fontSize: fontSize.sm, color: palette.textSecondary },
});