// app/modals/cambio-precio.tsx
import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTurnoStore, useMovimientosStore } from '../../src/store';
import { ScreenHeader, Card, Button, AppTextInput } from '../../src/ui/components/common';
import { palette, fontSize, spacing, borderRadius } from '../../src/ui/theme';
import { CambioPrecio } from '../../src/domain/entities';
import { generateId } from '../../src/data/database/uuid';

export default function CambioPrecioModal() {
  const { turnoActivo, inventarioInicial } = useTurnoStore();
  const { agregarCambioPrecio, cambiosPrecio } = useMovimientosStore();

  const [productoSeleccionado, setProductoSeleccionado] = useState<string | null>(null);
  const [precioNuevo, setPrecioNuevo] = useState('');
  const [cantVendidaAnterior, setCantVendidaAnterior] = useState('');
  const [cantRestante, setCantRestante] = useState('');
  const [saving, setSaving] = useState(false);
  const [registrados, setRegistrados] = useState<CambioPrecio[]>([]);

  const itemSeleccionado = inventarioInicial.find(
    (i) => i.productoId === productoSeleccionado
  );

  // Verificar si ya tiene un cambio de precio registrado
  const yaTimenCambio = (productoId: string) =>
    cambiosPrecio.some((c) => c.productoId === productoId);

  const handleGuardar = async () => {
    if (!turnoActivo || !itemSeleccionado) {
      Alert.alert('Selecciona un producto');
      return;
    }
    if (yaTimenCambio(itemSeleccionado.productoId)) {
      Alert.alert('Ya registrado', 'Este producto ya tiene un cambio de precio en este turno.');
      return;
    }
    const precioNuevoNum = parseFloat(precioNuevo);
    if (isNaN(precioNuevoNum) || precioNuevoNum <= 0) {
      Alert.alert('Precio inválido', 'Ingresa el nuevo precio válido.');
      return;
    }

    setSaving(true);
    const cambio: CambioPrecio = {
      id: generateId(),
      turnoId: turnoActivo.id,
      productoId: itemSeleccionado.productoId,
      productoNombre: itemSeleccionado.productoNombre,
      precioAnterior: itemSeleccionado.productoPrecio,
      precioNuevo: precioNuevoNum,
      cantidadVendidaAnterior: parseFloat(cantVendidaAnterior) || 0,
      cantidadRestante: parseFloat(cantRestante) || 0,
      fecha: new Date().toISOString(),
    };

    await agregarCambioPrecio(cambio);
    setRegistrados((prev) => [cambio, ...prev]);
    setProductoSeleccionado(null);
    setPrecioNuevo('');
    setCantVendidaAnterior('');
    setCantRestante('');
    setSaving(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Cambio de precio" showBack />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={20} color={palette.info} />
            <Text style={styles.infoText}>
              Selecciona el producto cuyo precio cambió. Indica cuánto se vendió al precio anterior y cuánto queda por vender al precio nuevo.
            </Text>
          </View>
        </Card>

        <Text style={styles.sectionLabel}>Producto</Text>
        {inventarioInicial.map((item) => {
          const tieneCambio = yaTimenCambio(item.productoId);
          return (
            <TouchableOpacity
              key={item.productoId}
              style={[
                styles.productoItem,
                productoSeleccionado === item.productoId && styles.productoItemSelected,
                tieneCambio && styles.productoItemCambiado,
              ]}
              onPress={() => {
                if (!tieneCambio) setProductoSeleccionado(item.productoId);
              }}
            >
              <View style={styles.productoItemInfo}>
                <Text style={styles.productoItemNombre}>{item.productoNombre}</Text>
                <Text style={styles.productoItemPrecio}>
                  Precio actual: ${item.productoPrecio.toFixed(2)}
                </Text>
              </View>
              {tieneCambio ? (
                <View style={styles.cambiadoBadge}>
                  <Text style={styles.cambiadoLabel}>Cambiado</Text>
                </View>
              ) : productoSeleccionado === item.productoId ? (
                <Ionicons name="checkmark-circle" size={22} color={palette.warning} />
              ) : null}
            </TouchableOpacity>
          );
        })}

        {itemSeleccionado && (
          <>
            <Card style={styles.precioCard}>
              <Text style={styles.precioCardTitle}>
                Cambiando precio de: {itemSeleccionado.productoNombre}
              </Text>
              <View style={styles.precioRow}>
                <View style={styles.precioItem}>
                  <Text style={styles.precioLabel}>Precio anterior</Text>
                  <Text style={styles.precioAnterior}>
                    ${itemSeleccionado.productoPrecio.toFixed(2)}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color={palette.textMuted} />
                <View style={styles.precioItem}>
                  <Text style={styles.precioLabel}>Precio nuevo</Text>
                  <TextInput
                    style={styles.precioInput}
                    value={precioNuevo}
                    onChangeText={setPrecioNuevo}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={palette.textMuted}
                    selectTextOnFocus
                  />
                </View>
              </View>
            </Card>

            <Card style={styles.cantCard}>
              <Text style={styles.cantCardTitle}>
                Distribucion de ventas
              </Text>
              <AppTextInput
                label="Cantidad vendida al precio anterior"
                placeholder="0"
                value={cantVendidaAnterior}
                onChangeText={setCantVendidaAnterior}
                keyboardType="decimal-pad"
              />
              <AppTextInput
                label="Cantidad que queda por vender al precio nuevo"
                placeholder="0"
                value={cantRestante}
                onChangeText={setCantRestante}
                keyboardType="decimal-pad"
              />
            </Card>

            <Button
              label="Guardar cambio de precio"
              onPress={handleGuardar}
              loading={saving}
              fullWidth
              style={styles.saveBtn}
            />
          </>
        )}

        {registrados.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Cambios registrados</Text>
            {registrados.map((c) => (
              <Card key={c.id} style={styles.registradoCard}>
                <View style={styles.registradoRow}>
                  <Ionicons name="pricetag-outline" size={18} color={palette.warning} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.registradoNombre}>{c.productoNombre}</Text>
                    <Text style={styles.registradoDetalle}>
                      ${c.precioAnterior.toFixed(2)} → ${c.precioNuevo.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 
    palette.surface0 
  },
  scroll: { 
    padding: spacing.base, 
    gap: spacing.md, 
    paddingBottom: spacing['3xl'] 
  },
  infoCard: { 
    borderColor: palette.info + '40', 
    backgroundColor: palette.infoDim 
  },
  infoRow: { 
    flexDirection: 'row', 
    gap: spacing.sm, 
    alignItems: 'flex-start' 
  },
  infoText: { 
    flex: 1, 
    fontSize: fontSize.sm, 
    color: palette.textSecondary, 
    lineHeight: 20 
  },
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
    borderColor: palette.warning,
    backgroundColor: palette.warningDim,
  },
  productoItemCambiado: {
    opacity: 0.5,
  },
  productoItemInfo: { 
    flex: 1 
  },
  productoItemNombre: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  productoItemPrecio: {
    fontSize: fontSize.sm,
    color: palette.textSecondary,
    marginTop: 2,
  },
  cambiadoBadge: {
    backgroundColor: palette.successDim,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  cambiadoLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: palette.success,
  },
  precioCard: { 
    gap: spacing.md 
  },
  precioCardTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  precioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  precioItem: { 
    alignItems: 'center', 
    gap: spacing.xs, 
    flex: 1 
  },
  precioLabel: { 
    fontSize: fontSize.xs, 
    color: palette.textMuted 
  },
  precioAnterior: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: palette.danger,
    textDecorationLine: 'line-through',
  },
  precioInput: {
    width: '100%',
    height: 48,
    backgroundColor: palette.surface2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: palette.warning,
    color: palette.accent,
    fontSize: fontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  cantCard: { 
    gap: spacing.md 
  },
  cantCardTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  saveBtn: { 
    marginTop: spacing.sm 
  },
  registradoCard: { 
    marginBottom: spacing.xs 
  },
  registradoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: spacing.sm 
  },
  registradoNombre: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  registradoDetalle: {
    fontSize: fontSize.sm,
    color: palette.textSecondary,
    marginTop: 2,
  },
});