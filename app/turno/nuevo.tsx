// app/turno/nuevo.tsx
import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTurnoStore, useProductoStore } from '../../src/store';
import { ScreenHeader, Card, Button } from '../../src/ui/components/common';
import { palette, fontSize, spacing, borderRadius } from '../../src/ui/theme';
import { Turno, InventarioItem } from '../../src/domain/entities';
import { generateId } from '../../src/data/database/uuid';
import { useEffect } from 'react';

interface ItemInventario {
  productoId: string;
  productoNombre: string;
  productoPrecio: number;
  cantidad: string;
}

export default function NuevoTurnoScreen() {
  const { iniciarTurno, guardarInventarioInicial } = useTurnoStore();
  const { productos, cargarProductos } = useProductoStore();
  const [items, setItems] = useState<ItemInventario[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    if (productos.length > 0) {
      setItems(
        productos.map((p) => ({
          productoId: p.id,
          productoNombre: p.nombre,
          productoPrecio: p.precio,
          cantidad: '',
        }))
      );
    }
  }, [productos]);

  const updateCantidad = (productoId: string, value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productoId === productoId ? { ...item, cantidad: value } : item
      )
    );
  };

  const handleIniciar = async () => {
    const itemsValidos = items.filter((i) => {
      const n = parseFloat(i.cantidad);
      return !isNaN(n) && n >= 0;
    });

    if (itemsValidos.length === 0) {
      Alert.alert(
        'Inventario vacío',
        'Ingresa la cantidad inicial de al menos un producto.'
      );
      return;
    }

    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const turnoId = generateId();
    const turno: Turno = {
      id: turnoId,
      fechaInicio: new Date().toISOString(),
      estado: 'activo',
    };

    await iniciarTurno(turno);

    const inventarioItems: InventarioItem[] = itemsValidos.map((i) => ({
      id: generateId(),
      turnoId,
      productoId: i.productoId,
      productoNombre: i.productoNombre,
      productoPrecio: i.productoPrecio,
      cantidad: parseFloat(i.cantidad),
      tipo: 'inicial',
    }));

    await guardarInventarioInicial(inventarioItems);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)/index');;
  };

  if (productos.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader title="Nuevo turno" showBack />
        <View style={styles.sinProductos}>
          <Ionicons name="cube-outline" size={48} color={palette.textMuted} />
          <Text style={styles.sinProductosTitulo}>Sin productos en catálogo</Text>
          <Text style={styles.sinProductosDesc}>
            Ve a la pestaña Productos y agrega los productos de tu cafetería antes de iniciar un turno.
          </Text>
          <Button
            label="Ir a productos"
            onPress={() => {
              router.replace('/(tabs)/productos');
            }}
            variant="secondary"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Nuevo turno" showBack />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.instruccion}>
          Ingresa la cantidad que tienes de cada producto al iniciar el turno.
        </Text>

        {items.map((item) => (
          <Card key={item.productoId} style={styles.itemCard}>
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemNombre}>{item.productoNombre}</Text>
                <Text style={styles.itemPrecio}>${item.productoPrecio.toFixed(2)}</Text>
              </View>
              <View style={styles.cantidadWrapper}>
                <TouchableOpacity
                  style={styles.cantBtn}
                  onPress={() => {
                    const current = parseFloat(item.cantidad) || 0;
                    if (current > 0) updateCantidad(item.productoId, String(current - 1));
                  }}
                >
                  <Ionicons name="remove" size={18} color={palette.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.cantidadText}>
                  {item.cantidad === '' ? '0' : item.cantidad}
                </Text>
                <TouchableOpacity
                  style={styles.cantBtn}
                  onPress={() => {
                    const current = parseFloat(item.cantidad) || 0;
                    updateCantidad(item.productoId, String(current + 1));
                  }}
                >
                  <Ionicons name="add" size={18} color={palette.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        ))}

        <Button
          label="Iniciar turno"
          onPress={handleIniciar}
          loading={saving}
          fullWidth
          style={styles.iniciarBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.surface0,
  },
  scroll: {
    padding: spacing.base,
    gap: spacing.sm,
    paddingBottom: spacing['3xl'],
  },
  instruccion: {
    fontSize: fontSize.sm,
    color: palette.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  itemCard: {
    marginBottom: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemNombre: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  itemPrecio: {
    fontSize: fontSize.sm,
    color: palette.accent,
    fontWeight: '500',
  },
  cantidadWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.surface2,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  cantBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface3,
    borderRadius: borderRadius.sm,
  },
  cantidadText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: palette.textPrimary,
    minWidth: 32,
    textAlign: 'center',
  },
  iniciarBtn: {
    marginTop: spacing.md,
  },
  sinProductos: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    gap: spacing.md,
  },
  sinProductosTitulo: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: palette.textPrimary,
    textAlign: 'center',
  },
  sinProductosDesc: {
    fontSize: fontSize.base,
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});