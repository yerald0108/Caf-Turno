// app/modals/merma.tsx
import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTurnoStore, useMovimientosStore, useProductoStore } from '../../src/store';
import { ScreenHeader, Card, Button, AppTextInput } from '../../src/ui/components/common';
import { palette, fontSize, spacing, borderRadius } from '../../src/ui/theme';
import { Merma, MotivoMerma } from '../../src/domain/entities';
import { generateId } from '../../src/data/database/uuid';

const MOTIVOS: { value: MotivoMerma; label: string; icon: string; color: string }[] = [
  { value: 'vencido', label: 'Vencido',  icon: 'time-outline',     color: palette.warning },
  { value: 'roto',    label: 'Roto',     icon: 'construct-outline', color: palette.danger  },
  { value: 'otro',    label: 'Otro',     icon: 'ellipsis-horizontal-outline', color: palette.textSecondary },
];

export default function MermaModal() {
  const { turnoActivo } = useTurnoStore();
  const { agregarMerma, mermas, cargarMovimientos } = useMovimientosStore();
  const { productos, cargarProductos } = useProductoStore();

  const [productoSeleccionado, setProductoSeleccionado] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState('1');
  const [motivo, setMotivo] = useState<MotivoMerma | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (turnoActivo) cargarMovimientos(turnoActivo.id);
  }, [turnoActivo]);

  useEffect(() => {
    cargarProductos();
  }, []);

  const producto = productos.find((p) => p.id === productoSeleccionado);

  const handleGuardar = async () => {
    if (!turnoActivo) return;
    if (!productoSeleccionado || !producto) {
      Alert.alert('Selecciona un producto');
      return;
    }
    if (!motivo) {
      Alert.alert('Selecciona el motivo de la merma.');
      return;
    }
    if (motivo === 'otro' && !descripcion.trim()) {
      Alert.alert('Describe el motivo', 'Cuando el motivo es "Otro", la descripción es obligatoria.');
      return;
    }

    setSaving(true);
    const merma: Merma = {
      id: generateId(),
      turnoId: turnoActivo.id,
      productoId: producto.id,
      productoNombre: producto.nombre,
      cantidad: parseFloat(cantidad) || 0,
      motivo,
      descripcion: descripcion.trim() || undefined,
      fecha: new Date().toISOString(),
    };

    await agregarMerma(merma);
    setProductoSeleccionado(null);
    setCantidad('1');
    setMotivo(null);
    setDescripcion('');
    setSaving(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Registrar merma" showBack />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.sectionLabel}>Producto afectado</Text>
        {productos.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[
              styles.productoItem,
              productoSeleccionado === p.id && styles.productoItemSelected,
            ]}
            onPress={() => {
              setProductoSeleccionado(p.id);
            }}
          >
            <Text style={styles.productoItemNombre}>{p.nombre}</Text>
            {productoSeleccionado === p.id && (
              <Ionicons name="checkmark-circle" size={22} color={palette.danger} />
            )}
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionLabel}>Cantidad</Text>
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

        <Text style={styles.sectionLabel}>Motivo</Text>
        <View style={styles.motivosRow}>
          {MOTIVOS.map((m) => (
            <TouchableOpacity
              key={m.value}
              style={[
                styles.motivoBtn,
                motivo === m.value && { borderColor: m.color, backgroundColor: m.color + '18' },
              ]}
              onPress={() => {
                setMotivo(m.value);
              }}
            >
              <Ionicons
                name={m.icon as any}
                size={22}
                color={motivo === m.value ? m.color : palette.textMuted}
              />
              <Text style={[
                styles.motivoLabel,
                motivo === m.value && { color: m.color },
              ]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {(motivo === 'otro' || motivo) && (
          <AppTextInput
            label={motivo === 'otro' ? 'Descripción (obligatoria)' : 'Descripción (opcional)'}
            placeholder="Describe qué pasó con el producto"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={2}
          />
        )}

        <Button
          label="Registrar merma"
          onPress={handleGuardar}
          loading={saving}
          fullWidth
          style={styles.saveBtn}
        />

        {mermas.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Mermas del turno</Text>
            {mermas.map((m) => (
              <Card key={m.id} style={styles.registradaCard}>
                <View style={styles.registradaRow}>
                  <Ionicons name="warning" size={18} color={palette.danger} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.registradaNombre}>{m.productoNombre} x{m.cantidad}</Text>
                    <Text style={styles.registradaFecha}>
                      {m.motivo}{m.descripcion ? ` · ${m.descripcion}` : ''}
                    </Text>
                  </View>
                  <Text style={styles.registradaHora}>
                    {new Date(m.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
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
    backgroundColor: palette.surface0 
  },
  scroll: { 
    padding: spacing.base, 
    gap: spacing.md, 
    paddingBottom: spacing['3xl'] 
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
    justifyContent: 'space-between',
    backgroundColor: palette.surface1,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: palette.surface3,
    padding: spacing.base,
  },
  productoItemSelected: {
    borderColor: palette.danger,
    backgroundColor: palette.dangerDim,
  },
  productoItemNombre: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  cantidadInput: {
    height: 56,
    color: palette.textPrimary,
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    textAlign: 'center',
  },
  motivosRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  motivoBtn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: palette.surface3,
    backgroundColor: palette.surface1,
  },
  motivoLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: palette.textMuted,
  },
  saveBtn: { 
    marginTop: spacing.sm 
  },
  registradaCard: { marginBottom: spacing.xs },
  registradaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  registradaNombre: { fontSize: fontSize.base, fontWeight: '600', color: palette.textPrimary },
  registradaFecha: { fontSize: fontSize.xs, color: palette.textMuted, marginTop: 2 },
  registradaHora: { fontSize: fontSize.xs, color: palette.textMuted },
});