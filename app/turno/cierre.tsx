// app/turno/cierre.tsx
import { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTurnoStore, useMovimientosStore } from '../../src/store';
import { ScreenHeader, Card, Button, AnimatedNumber } from '../../src/ui/components/common';
import { palette, fontSize, spacing, borderRadius } from '../../src/ui/theme';
import { InventarioItem } from '../../src/domain/entities';
import { calcularResumenTurno } from '../../src/domain/usecases/calcularResumenTurno';
import { TurnoRepository } from '../../src/data/repositories';

const repo = new TurnoRepository();

export default function CierreScreen() {
  const {
    turnoActivo,
    inventarioInicial,
    inventarioFinal,
    cargarInventarioInicial,
    cargarInventarioFinal,
    cerrarTurno,
  } = useTurnoStore();

  const { entradas, salidasFamiliares, gastos, mermas, cambiosPrecio, cargarMovimientos } = useMovimientosStore();
  const [cantidadesFinales, setCantidadesFinales] = useState<Record<string, string>>({});
  const [paso, setPaso] = useState<'inventario' | 'resumen'>('inventario');
  const [resumen, setResumen] = useState<ReturnType<typeof calcularResumenTurno> | null>(null);
  const [cerrando, setCerrando] = useState(false);

  useEffect(() => {
    if (!turnoActivo) return;
    cargarInventarioInicial(turnoActivo.id);
    cargarMovimientos(turnoActivo.id);
  }, [turnoActivo]);

  // Productos que participaron en el turno = inventario inicial + productos
  // que llegaron por entradas pero no estaban en el inventario inicial
  const productosDelTurno = useMemo(() => {
    const mapa = new Map<string, { productoId: string; productoNombre: string; productoPrecio: number }>();

    for (const item of inventarioInicial) {
      mapa.set(item.productoId, {
        productoId: item.productoId,
        productoNombre: item.productoNombre,
        productoPrecio: item.productoPrecio,
      });
    }

    for (const entrada of entradas) {
      if (!mapa.has(entrada.productoId)) {
        mapa.set(entrada.productoId, {
          productoId: entrada.productoId,
          productoNombre: entrada.productoNombre,
          productoPrecio: entrada.productoPrecio,
        });
      }
    }

    return Array.from(mapa.values());
  }, [inventarioInicial, entradas]);

  useEffect(() => {
    if (productosDelTurno.length > 0) {
      setCantidadesFinales((prev) => {
        const nuevo: Record<string, string> = { ...prev };
        for (const p of productosDelTurno) {
          if (!(p.productoId in nuevo)) {
            nuevo[p.productoId] = '';
          }
        }
        return nuevo;
      });
    }
  }, [productosDelTurno]);

  const handleCalcular = async () => {
    if (!turnoActivo) return;


    // Guardar inventario final en la BD
    const itemsFinales: InventarioItem[] = productosDelTurno.map((item) => ({
      id: `${turnoActivo.id}-${item.productoId}-final`,  // ← ID determinístico
      turnoId: turnoActivo.id,
      productoId: item.productoId,
      productoNombre: item.productoNombre,
      productoPrecio: item.productoPrecio,
      cantidad: parseFloat(cantidadesFinales[item.productoId]) || 0,
      tipo: 'final' as const,
    }));

    for (const item of itemsFinales) {
      await repo.guardarInventarioItem(item);
    }

    await cargarInventarioFinal(turnoActivo.id);

    const fechaCierre = new Date().toISOString();
    const calc = calcularResumenTurno({
      turnoId: turnoActivo.id,
      fechaInicio: turnoActivo.fechaInicio,
      fechaCierre,
      inventarioInicial,
      inventarioFinal: itemsFinales,
      entradas,
      salidasFamiliares,
      gastos,
      mermas,
      cambiosPrecio,
    });

    setResumen(calc);
    setPaso('resumen');
  };

  const handleCerrarTurno = async () => {
    Alert.alert(
      'Cerrar turno',
      '¿Confirmas el cierre del turno? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar turno',
          style: 'destructive',
          onPress: async () => {
            setCerrando(true);
            await cerrarTurno();
            router.replace('/(tabs)' as any);
          },
        },
      ]
    );
  };

  if (!turnoActivo) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader title="Cierre de turno" showBack />
        <View style={styles.center}>
          <Text style={styles.emptyText}>No hay turno activo.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Paso 1: Ingresar inventario final ──────────────────────
  if (paso === 'inventario') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader title="Cierre de turno" showBack />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={20} color={palette.info} />
              <Text style={styles.infoText}>
                Ingresa cuánto te queda de cada producto. La app calculará cuánto debes tener en caja.
              </Text>
            </View>
          </Card>

          <Text style={styles.sectionLabel}>Inventario final</Text>

          {productosDelTurno.map((item) => (
            <Card key={item.productoId} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemNombre}>{item.productoNombre}</Text>
                <Text style={styles.itemInicial}>
                  Inicial: {inventarioInicial.find((i) => i.productoId === item.productoId)?.cantidad ?? 0}
                </Text>
              </View>
              <View style={styles.cantidadRow}>
                <Text style={styles.cantidadLabel}>Cantidad final</Text>
                <TextInput
                  style={styles.cantidadInput}
                  value={cantidadesFinales[item.productoId] || ''}
                  onChangeText={(val) =>
                    setCantidadesFinales((prev) => ({ ...prev, [item.productoId]: val }))
                  }
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={palette.textMuted}
                  selectTextOnFocus
                />
              </View>
            </Card>
          ))}

          <Button
            label="Calcular resultado"
            onPress={handleCalcular}
            fullWidth
            style={styles.calcularBtn}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Paso 2: Mostrar resumen ────────────────────────────────
  if (paso === 'resumen' && resumen) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader title="Resumen del turno" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Saldo esperado — el número principal */}
          <Card style={styles.saldoCard} elevated>
            <Text style={styles.saldoLabel}>Saldo esperado en caja</Text>
            <AnimatedNumber
              value={resumen.saldoEsperadoCaja}
              prefix="$"
              style={styles.saldoMonto}
              duration={1000}
            />
            <View style={styles.saldoDesglose}>
              <View style={styles.saldoItem}>
                <Text style={styles.saldoItemLabel}>Ventas brutas</Text>
                <Text style={[styles.saldoItemValue, { color: palette.success }]}>
                  +${resumen.totalBruto.toFixed(2)}
                </Text>
              </View>
              <View style={styles.saldoItem}>
                <Text style={styles.saldoItemLabel}>Gastos</Text>
                <Text style={[styles.saldoItemValue, { color: palette.danger }]}>
                  -${resumen.totalGastos.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Detalle por producto */}
          <Text style={styles.sectionLabel}>Detalle por producto</Text>
          {resumen.productos.map((p) => (
            <Card key={p.productoId} style={styles.productoCard}>
              <View style={styles.productoHeader}>
                <Text style={styles.productoNombre}>{p.productoNombre}</Text>
                <Text style={styles.productoTotal}>
                  ${p.totalVentas.toFixed(2)}
                </Text>
              </View>
              <View style={styles.productoDetalle}>
                <DetalleItem label="Inicial" value={p.cantidadInicial} />
                {p.cantidadEntradas > 0 && (
                  <DetalleItem label="Entradas" value={`+${p.cantidadEntradas}`} color={palette.success} />
                )}
                <DetalleItem label="Final" value={p.cantidadFinal} />
                <DetalleItem
                  label="Vendido"
                  value={p.cantidadVendida}
                  color={palette.accent}
                  bold
                />
              </View>
              <Text style={styles.precioUnitario}>
                {p.cantidadVendida} x ${p.precioUnitario.toFixed(2)}
              </Text>
            </Card>
          ))}

          {/* Gastos del turno */}
          {gastos.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Gastos registrados</Text>
              {gastos.map((g) => (
                <Card key={g.id} style={styles.gastoCard}>
                  <View style={styles.gastoRow}>
                    <Ionicons name="cash-outline" size={18} color={palette.warning} />
                    <Text style={styles.gastoDesc}>{g.descripcion}</Text>
                    <Text style={styles.gastoMonto}>-${g.monto.toFixed(2)}</Text>
                  </View>
                </Card>
              ))}
            </>
          )}

          {/* Mermas del turno */}
          {mermas.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Mermas registradas</Text>
              {mermas.map((m) => (
                <Card key={m.id} style={styles.gastoCard}>
                  <View style={styles.gastoRow}>
                    <Ionicons name="warning-outline" size={18} color={palette.danger} />
                    <Text style={styles.gastoDesc}>
                      {m.productoNombre} x{m.cantidad} — {m.motivo}
                    </Text>
                  </View>
                </Card>
              ))}
            </>
          )}

          {/* Salidas familiares */}
          {salidasFamiliares.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Salidas familiares</Text>
              {salidasFamiliares.map((s) => (
                <Card key={s.id} style={styles.gastoCard}>
                  <View style={styles.gastoRow}>
                    <Ionicons name="people-outline" size={18} color={palette.info} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gastoDesc}>{s.persona}</Text>
                      <Text style={styles.salidaItems}>
                        {s.items.map((i) => `${i.productoNombre} x${i.cantidad}`).join(', ')}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </>
          )}

          {/* Cambios de precio */}
          {cambiosPrecio.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Cambios de precio</Text>
              {cambiosPrecio.map((c) => (
                <Card key={c.id} style={styles.gastoCard}>
                  <View style={styles.gastoRow}>
                    <Ionicons name="pricetag-outline" size={18} color={palette.accent} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gastoDesc}>{c.productoNombre}</Text>
                      <Text style={styles.cambioDetalle}>
                        ${c.precioAnterior.toFixed(2)} → ${c.precioNuevo.toFixed(2)}
                      </Text>
                      <Text style={styles.cambioDetalle}>
                        {c.cantidadVendidaAnterior} uds al precio anterior · {c.cantidadRestante} uds al precio nuevo
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </>
          )}

          {/* Botón de cierre definitivo */}
          <Button
            label="Confirmar y cerrar turno"
            onPress={handleCerrarTurno}
            loading={cerrando}
            variant="danger"
            fullWidth
            style={styles.cerrarBtn}
          />

          <TouchableOpacity
            style={styles.volverBtn}
            onPress={() => setPaso('inventario')}
          >
            <Ionicons name="arrow-back-outline" size={16} color={palette.textSecondary} />
            <Text style={styles.volverLabel}>Editar inventario final</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

function DetalleItem({
  label, value, color, bold,
}: {
  label: string;
  value: string | number;
  color?: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.detalleItem}>
      <Text style={styles.detalleLabel}>{label}</Text>
      <Text style={[
        styles.detalleValue,
        color ? { color } : {},
        bold ? { fontWeight: '700' } : {},
      ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, backgroundColor: 
    palette.surface0 
  },
  scroll: { 
    padding: spacing.base, 
    gap: spacing.md, 
    paddingBottom: spacing['3xl'] 
  },
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  emptyText: { 
    fontSize: fontSize.base, 
    color: palette.textSecondary 
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
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.xs,
  },
  itemCard: { 
    gap: spacing.sm 
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemNombre: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  itemInicial: {
    fontSize: fontSize.sm,
    color: palette.textMuted,
  },
  cantidadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.surface2,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  cantidadLabel: {
    fontSize: fontSize.sm,
    color: palette.textSecondary,
    fontWeight: '500',
  },
  cantidadInput: {
    width: 80,
    height: 44,
    backgroundColor: palette.surface2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: palette.surface3,
    color: palette.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '700',
    textAlign: 'center',
  },
  calcularBtn: { 
    marginTop: spacing.sm 
  },

  // Resumen
  saldoCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    borderColor: palette.accent + '40',
  },
  saldoLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  saldoMonto: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: palette.accent,
    letterSpacing: -1,
  },
  saldoDesglose: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.xs,
  },
  saldoItem: { 
    alignItems: 'center', 
    gap: 2 
  },
  saldoItemLabel: {
    fontSize: fontSize.xs,
    color: palette.textMuted,
  },
  saldoItemValue: {
    fontSize: fontSize.base,
    fontWeight: '700',
  },
  productoCard: { 
    gap: spacing.sm 
  },
  productoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productoNombre: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: palette.textPrimary,
    flex: 1,
  },
  productoTotal: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: palette.accent,
  },
  productoDetalle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    backgroundColor: palette.surface2,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  detalleItem: { 
    alignItems: 'center', 
    minWidth: 60 
  },
  detalleLabel: {
    fontSize: fontSize.xs,
    color: palette.textMuted,
    marginBottom: 2,
  },
  detalleValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  precioUnitario: {
    fontSize: fontSize.xs,
    color: palette.textMuted,
    textAlign: 'right',
  },

  gastoCard: { 
    marginBottom: spacing.xs 
  },
  gastoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  gastoDesc: {
    flex: 1,
    fontSize: fontSize.base,
    color: palette.textSecondary,
  },
  gastoMonto: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: palette.warning,
  },
  salidaItems: {
    fontSize: fontSize.sm,
    color: palette.textMuted,
    marginTop: 2,
  },

  cerrarBtn: { 
    marginTop: spacing.md 
  },
  volverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  volverLabel: {
    fontSize: fontSize.sm,
    color: palette.textSecondary,
  },
  cambioDetalle: {
    fontSize: fontSize.xs,
    color: palette.textMuted,
    marginTop: 2,
  },
});