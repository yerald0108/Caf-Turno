// app/turno/inventario-inicial.tsx
import { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTurnoStore } from '../../src/store';
import { ScreenHeader, Card, EmptyState } from '../../src/ui/components/common';
import { palette, fontSize, spacing } from '../../src/ui/theme';

export default function InventarioInicialScreen() {
  const { turnoActivo, inventarioInicial, cargarInventarioInicial } = useTurnoStore();

  useEffect(() => {
    if (turnoActivo) {
      cargarInventarioInicial(turnoActivo.id);
    }
  }, [turnoActivo]);

  const formatHora = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const totalProductos = inventarioInicial.reduce((sum, i) => sum + i.cantidad, 0);
  const totalValor = inventarioInicial.reduce(
    (sum, i) => sum + i.cantidad * i.productoPrecio, 0
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Inventario inicial"
        subtitle={turnoActivo ? `Turno iniciado a las ${formatHora(turnoActivo.fechaInicio)}` : ''}
        showBack
      />

      <FlatList
        data={inventarioInicial}
        keyExtractor={(item) => item.productoId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          inventarioInicial.length > 0 ? (
            <Card style={styles.resumenCard}>
              <View style={styles.resumenRow}>
                <View style={styles.resumenItem}>
                  <Text style={styles.resumenLabel}>Productos</Text>
                  <Text style={styles.resumenValue}>{inventarioInicial.length}</Text>
                </View>
                <View style={styles.resumenDivider} />
                <View style={styles.resumenItem}>
                  <Text style={styles.resumenLabel}>Unidades totales</Text>
                  <Text style={styles.resumenValue}>{totalProductos}</Text>
                </View>
                <View style={styles.resumenDivider} />
                <View style={styles.resumenItem}>
                  <Text style={styles.resumenLabel}>Valor total</Text>
                  <Text style={[styles.resumenValue, { color: palette.accent }]}>
                    ${totalValor.toFixed(2)}
                  </Text>
                </View>
              </View>
            </Card>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="Sin inventario"
            description="No se registraron productos al iniciar este turno."
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.itemCard}>
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemNombre}>{item.productoNombre}</Text>
                <Text style={styles.itemPrecio}>${item.productoPrecio.toFixed(2)} por unidad</Text>
              </View>
              <View style={styles.itemRight}>
                <View style={styles.cantidadBadge}>
                  <Ionicons name="cube-outline" size={14} color={palette.accent} />
                  <Text style={styles.cantidadText}>{item.cantidad}</Text>
                </View>
                <Text style={styles.itemTotal}>
                  ${(item.cantidad * item.productoPrecio).toFixed(2)}
                </Text>
              </View>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: palette.surface0 
  },
  list: {
    padding: spacing.base,
    gap: spacing.sm,
    paddingBottom: spacing['3xl'],
  },
  resumenCard: {
    marginBottom: spacing.sm,
  },
  resumenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  resumenItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  resumenLabel: {
    fontSize: fontSize.xs,
    color: palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resumenValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  resumenDivider: {
    width: 1,
    height: 36,
    backgroundColor: palette.surface3,
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
    color: palette.textSecondary,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  cantidadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.accentDim,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  cantidadText: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: palette.accent,
  },
  itemTotal: {
    fontSize: fontSize.sm,
    color: palette.textMuted,
    fontWeight: '500',
  },
});