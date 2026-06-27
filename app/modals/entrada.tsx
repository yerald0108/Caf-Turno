// app/modals/entrada.tsx
import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTurnoStore, useMovimientosStore, useProductoStore } from '../../src/store';
import { ScreenHeader, Card, Button, AppTextInput } from '../../src/ui/components/common';
import { palette, fontSize, spacing, borderRadius } from '../../src/ui/theme';
import { EntradaProducto } from '../../src/domain/entities';
import { generateId } from '../../src/data/database/uuid';

export default function EntradaModal() {
  const { turnoActivo } = useTurnoStore();
  const { agregarEntrada } = useMovimientosStore();
  const { productos, cargarProductos } = useProductoStore();

  const [productoSeleccionado, setProductoSeleccionado] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState('');
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const producto = productos.find((p) => p.id === productoSeleccionado);

  const handleGuardar = async () => {
    if (!turnoActivo) return;
    if (!productoSeleccionado || !producto) {
      Alert.alert('Selecciona un producto', 'Debes elegir un producto para registrar la entrada.');
      return;
    }
    const cantNum = parseFloat(cantidad);
    if (isNaN(cantNum) || cantNum <= 0) {
      Alert.alert('Cantidad inválida', 'Ingresa una cantidad válida mayor a 0.');
      return;
    }

    setSaving(true);
    const entrada: EntradaProducto = {
      id: generateId(),
      turnoId: turnoActivo.id,
      productoId: producto.id,
      productoNombre: producto.nombre,
      productoPrecio: producto.precio,
      cantidad: cantNum,
      fecha: new Date().toISOString(),
      notas: notas.trim() || undefined,
    };

    await agregarEntrada(entrada);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Entrada de producto" showBack />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.sectionLabel}>Selecciona el producto</Text>
        {productos.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[
              styles.productoItem,
              productoSeleccionado === p.id && styles.productoItemSelected,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setProductoSeleccionado(p.id);
            }}
          >
            <View style={styles.productoItemInfo}>
              <Text style={styles.productoItemNombre}>{p.nombre}</Text>
              <Text style={styles.productoItemPrecio}>${p.precio.toFixed(2)}</Text>
            </View>
            {productoSeleccionado === p.id && (
              <Ionicons name="checkmark-circle" size={22} color={palette.success} />
            )}
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionLabel}>Cantidad que entra</Text>
        <Card>
          <TextInput
            style={styles.cantidadInput}
            value={cantidad}
            onChangeText={setCantidad}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={palette.textMuted}
            selectTextOnFocus
          />
        </Card>

        <AppTextInput
          label="Notas (opcional)"
          placeholder="Ej: Llegó del proveedor"
          value={notas}
          onChangeText={setNotas}
          multiline
          numberOfLines={2}
          containerStyle={styles.notasInput}
        />

        <Button
          label="Registrar entrada"
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
  container: { flex: 1, backgroundColor: palette.surface0 },
  scroll: { padding: spacing.base, gap: spacing.md, paddingBottom: spacing['3xl'] },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.xs,
  },
  productoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface1,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: palette.surface3,
    padding: spacing.base,
  },
  productoItemSelected: {
    borderColor: palette.success,
    backgroundColor: palette.successDim,
  },
  productoItemInfo: { flex: 1 },
  productoItemNombre: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  productoItemPrecio: {
    fontSize: fontSize.sm,
    color: palette.accent,
    marginTop: 2,
  },
  cantidadInput: {
    height: 56,
    color: palette.textPrimary,
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    textAlign: 'center',
  },
  notasInput: { marginTop: spacing.xs },
  saveBtn: { marginTop: spacing.sm },
});