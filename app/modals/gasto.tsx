// app/modals/gasto.tsx
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTurnoStore, useMovimientosStore } from '../../src/store';
import { ScreenHeader, Card, Button, AppTextInput } from '../../src/ui/components/common';
import { palette, fontSize, spacing } from '../../src/ui/theme';
import { Gasto } from '../../src/domain/entities';
import { generateId } from '../../src/data/database/uuid';

export default function GastoModal() {
  const { turnoActivo } = useTurnoStore();
  const { agregarGasto } = useMovimientosStore();

  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);

  const handleGuardar = async () => {
    if (!turnoActivo) return;
    if (!descripcion.trim()) {
      Alert.alert('Falta la descripción', 'Describe en qué se gastó el dinero.');
      return;
    }
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto válido mayor a 0.');
      return;
    }

    setSaving(true);
    try {
      const gasto: Gasto = {
        id: generateId(),
        turnoId: turnoActivo.id,
        descripcion: descripcion.trim(),
        monto: montoNum,
        fecha: new Date().toISOString(),
        notas: notas.trim() || undefined,
      };
      await agregarGasto(gasto);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el gasto. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const montoNum = parseFloat(monto) || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Registrar gasto" showBack />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <AppTextInput
          label="Descripción"
          placeholder="Ej: Compra de servilletas"
          value={descripcion}
          onChangeText={setDescripcion}
          autoCapitalize="sentences"
        />

        <AppTextInput
          label="Monto"
          placeholder="0.00"
          value={monto}
          onChangeText={setMonto}
          keyboardType="decimal-pad"
        />

        {montoNum > 0 && (
          <Card style={styles.previewCard}>
            <Text style={styles.previewLabel}>Se descontará de caja</Text>
            <Text style={styles.previewMonto}>-${montoNum.toFixed(2)}</Text>
          </Card>
        )}

        <AppTextInput
          label="Notas (opcional)"
          placeholder="Observaciones adicionales"
          value={notas}
          onChangeText={setNotas}
          multiline
          numberOfLines={2}
        />

        <Button
          label="Registrar gasto"
          onPress={handleGuardar}
          loading={saving}
          fullWidth
          style={styles.saveBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: palette.surface0 
  },
  scroll: { 
    padding: spacing.base, 
    gap: spacing.md, 
    paddingBottom: spacing['3xl'] 
  },
  previewCard: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  previewLabel: {
    fontSize: fontSize.sm,
    color: palette.textSecondary,
    fontWeight: '500',
  },
  previewMonto: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: palette.warning,
    letterSpacing: -1,
  },
  saveBtn: { marginTop: spacing.sm },
});