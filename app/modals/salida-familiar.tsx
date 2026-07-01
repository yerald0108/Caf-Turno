// app/modals/salida-familiar.tsx
import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTurnoStore, useMovimientosStore, useProductoStore } from '../../src/store';
import { ScreenHeader, Card, Button, AppTextInput } from '../../src/ui/components/common';
import { palette, fontSize, spacing, borderRadius } from '../../src/ui/theme';
import { SalidaFamiliar, SalidaFamiliarItem } from '../../src/domain/entities';
import { generateId } from '../../src/data/database/uuid';

interface ItemSeleccionado {
  productoId: string;
  productoNombre: string;
  cantidad: number;
}

export default function SalidaFamiliarModal() {
  const { turnoActivo } = useTurnoStore();
  const { agregarSalidaFamiliar, salidasFamiliares, cargarMovimientos } = useMovimientosStore();  const { productos, cargarProductos } = useProductoStore();

  const [persona, setPersona] = useState('');
  const [itemsSeleccionados, setItemsSeleccionados] = useState<ItemSeleccionado[]>([]);
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (turnoActivo) cargarMovimientos(turnoActivo.id);
  }, [turnoActivo]);

  useEffect(() => {
    cargarProductos();
  }, []);

  const toggleProducto = (productoId: string, productoNombre: string) => {
    const existe = itemsSeleccionados.find((i) => i.productoId === productoId);
    if (existe) {
      setItemsSeleccionados((prev) => prev.filter((i) => i.productoId !== productoId));
    } else {
      setItemsSeleccionados((prev) => [...prev, { productoId, productoNombre, cantidad: 1 }]);
    }
  };

  const updateCantidad = (productoId: string, delta: number) => {
    setItemsSeleccionados((prev) =>
      prev.map((i) => {
        if (i.productoId !== productoId) return i;
        const nueva = i.cantidad + delta;
        return nueva > 0 ? { ...i, cantidad: nueva } : i;
      })
    );
  };

  const handleGuardar = async () => {
    if (!turnoActivo) return;
    if (!persona.trim()) {
      Alert.alert('Falta el nombre', '¿Quién retiró los productos?');
      return;
    }
    if (itemsSeleccionados.length === 0) {
      Alert.alert('Sin productos', 'Selecciona al menos un producto.');
      return;
    }

    setSaving(true);
    try {
      const items: SalidaFamiliarItem[] = itemsSeleccionados.map((i) => ({
        productoId: i.productoId,
        productoNombre: i.productoNombre,
        cantidad: i.cantidad,
      }));

      const salida: SalidaFamiliar = {
        id: generateId(),
        turnoId: turnoActivo.id,
        persona: persona.trim(),
        items,
        fecha: new Date().toISOString(),
        notas: notas.trim() || undefined,
      };

      await agregarSalidaFamiliar(salida);
      setPersona('');
      setItemsSeleccionados([]);
      setNotas('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar la salida. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Salida familiar" showBack />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <AppTextInput
          label="Quien retira"
          placeholder="Ej: Maria, el encargado..."
          value={persona}
          onChangeText={setPersona}
          autoCapitalize="words"
        />

        <Text style={styles.sectionLabel}>Productos retirados</Text>
        {productos.map((p) => {
          const seleccionado = itemsSeleccionados.find((i) => i.productoId === p.id);
          return (
            <View key={p.id}>
              <TouchableOpacity
                style={[
                  styles.productoItem,
                  seleccionado && styles.productoItemSelected,
                ]}
                onPress={() => toggleProducto(p.id, p.nombre)}
              >
                <View style={styles.productoItemInfo}>
                  <Text style={styles.productoItemNombre}>{p.nombre}</Text>
                </View>
                <Ionicons
                  name={seleccionado ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={seleccionado ? palette.info : palette.textMuted}
                />
              </TouchableOpacity>

              {seleccionado && (
                <Card style={styles.cantidadCard}>
                  <View style={styles.cantidadRow}>
                    <Text style={styles.cantidadLabel}>Cantidad</Text>
                    <TextInput
                      style={styles.cantidadInput}
                      value={String(seleccionado.cantidad)}
                      onChangeText={(val) => {
                        const num = parseFloat(val) || 0;
                        setItemsSeleccionados((prev) =>
                          prev.map((i) =>
                            i.productoId === p.id ? { ...i, cantidad: num } : i
                          )
                        );
                      }}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={palette.textMuted}
                      selectTextOnFocus
                    />
                  </View>
                </Card>
              )}
            </View>
          );
        })}

        <AppTextInput
          label="Notas (opcional)"
          placeholder="Observaciones adicionales"
          value={notas}
          onChangeText={setNotas}
          multiline
          numberOfLines={2}
        />

        <Button
          label="Registrar salida"
          onPress={handleGuardar}
          loading={saving}
          fullWidth
          style={styles.saveBtn}
        />
        {salidasFamiliares.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Salidas del turno</Text>
            {salidasFamiliares.map((s) => (
              <Card key={s.id} style={styles.registradoCard}>
                <View style={styles.registradoRow}>
                  <Ionicons name="people" size={18} color={palette.info} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.registradoPersona}>{s.persona}</Text>
                    <Text style={styles.registradoItems}>
                      {s.items.map((i) => `${i.productoNombre} x${i.cantidad}`).join(', ')}
                    </Text>
                  </View>
                  <Text style={styles.registradoHora}>
                    {new Date(s.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
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
    backgroundColor: palette.surface1,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: palette.surface3,
    padding: spacing.base,
  },
  productoItemSelected: {
    borderColor: palette.info,
    backgroundColor: palette.infoDim,
  },
  productoItemInfo: { 
    flex: 1 
  },
  productoItemNombre: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  cantidadCard: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    marginLeft: spacing.md,
  },
  cantidadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cantidadLabel: {
    fontSize: fontSize.base,
    color: palette.textSecondary,
    fontWeight: '500',
  },
  cantidadInput: {
    width: 80,
    height: 44,
    backgroundColor: palette.surface2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: palette.info,
    color: palette.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '700',
    textAlign: 'center',
  },
  saveBtn: { 
    marginTop: spacing.sm 
  },
  registradoCard: { marginBottom: spacing.xs },
  registradoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  registradoPersona: { fontSize: fontSize.base, fontWeight: '600', color: palette.textPrimary },
  registradoItems: { fontSize: fontSize.sm, color: palette.textMuted, marginTop: 2 },
  registradoHora: { fontSize: fontSize.xs, color: palette.textMuted },
});