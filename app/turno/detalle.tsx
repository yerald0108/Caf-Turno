// app/turno/detalle.tsx
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, Card, Badge } from '../../src/ui/components/common';
import { palette, fontSize, spacing, borderRadius } from '../../src/ui/theme';
import { TurnoRepository } from '../../src/data/repositories';
import { MovimientosRepository } from '../../src/data/repositories';
import { calcularResumenTurno } from '../../src/domain/usecases/calcularResumenTurno';
import { ResumenTurno } from '../../src/domain/entities';

const turnoRepo = new TurnoRepository();
const movRepo = new MovimientosRepository();

export default function DetalleTurnoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [resumen, setResumen] = useState<ResumenTurno | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    cargarDetalle(id);
  }, [id]);

  const cargarDetalle = async (turnoId: string) => {
    const turnos = await turnoRepo.obtenerTodos();
    const turno = turnos.find((t) => t.id === turnoId);
    if (!turno) return;

    const [inventarioInicial, inventarioFinal, entradas, salidasFamiliares, gastos, mermas, cambiosPrecio] =
      await Promise.all([
        turnoRepo.obtenerInventario(turnoId, 'inicial'),
        turnoRepo.obtenerInventario(turnoId, 'final'),
        movRepo.obtenerEntradas(turnoId),
        movRepo.obtenerSalidasFamiliares(turnoId),
        movRepo.obtenerGastos(turnoId),
        movRepo.obtenerMermas(turnoId),
        movRepo.obtenerCambiosPrecio(turnoId),
      ]);

    const calc = calcularResumenTurno({
      turnoId,
      fechaInicio: turno.fechaInicio,
      fechaCierre: turno.fechaCierre ?? new Date().toISOString(),
      inventarioInicial,
      inventarioFinal,
      entradas,
      salidasFamiliares,
      gastos,
      mermas,
      cambiosPrecio,
    });

    setResumen(calc);
    setLoading(false);
  };

  const formatFecha = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const formatHora = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader title="Detalle del turno" showBack />
        <View style={styles.center}>
          <Text style={styles.loadingText}>Calculando resumen...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!resumen) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader title="Detalle del turno" showBack />
        <View style={styles.center}>
          <Text style={styles.loadingText}>No se encontró el turno.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Detalle del turno"
        subtitle={formatFecha(resumen.fechaInicio)}
        showBack
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Horario */}
        <Card style={styles.horarioCard}>
          <View style={styles.horarioRow}>
            <View style={styles.horarioItem}>
              <Ionicons name="play-circle-outline" size={20} color={palette.success} />
              <Text style={styles.horarioLabel}>Apertura</Text>
              <Text style={styles.horarioHora}>{formatHora(resumen.fechaInicio)}</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={palette.textMuted} />
            <View style={styles.horarioItem}>
              <Ionicons name="stop-circle-outline" size={20} color={palette.danger} />
              <Text style={styles.horarioLabel}>Cierre</Text>
              <Text style={styles.horarioHora}>{formatHora(resumen.fechaCierre)}</Text>
            </View>
          </View>
        </Card>

        {/* Saldo principal */}
        <Card style={styles.saldoCard} elevated>
          <Text style={styles.saldoLabel}>Saldo esperado en caja</Text>
          <Text style={styles.saldoMonto}>${resumen.saldoEsperadoCaja.toFixed(2)}</Text>
          <View style={styles.saldoDesglose}>
            <View style={styles.saldoItem}>
              <Text style={styles.saldoItemLabel}>Ventas brutas</Text>
              <Text style={[styles.saldoItemValue, { color: palette.success }]}>
                +${resumen.totalBruto.toFixed(2)}
              </Text>
            </View>
            <View style={styles.saldoDivider} />
            <View style={styles.saldoItem}>
              <Text style={styles.saldoItemLabel}>Gastos</Text>
              <Text style={[styles.saldoItemValue, { color: palette.danger }]}>
                -${resumen.totalGastos.toFixed(2)}
              </Text>
            </View>
            <View style={styles.saldoDivider} />
            <View style={styles.saldoItem}>
              <Text style={styles.saldoItemLabel}>Sal. familiar</Text>
              <Text style={[styles.saldoItemValue, { color: palette.info }]}>
                {resumen.totalSalidaFamiliar} uds
              </Text>
            </View>
          </View>
        </Card>

        {/* Detalle por producto */}
        <Text style={styles.sectionLabel}>Productos</Text>
        {resumen.productos.map((p) => (
          <Card key={p.productoId} style={styles.productoCard}>
            <View style={styles.productoHeader}>
              <Text style={styles.productoNombre}>{p.productoNombre}</Text>
              <Text style={styles.productoTotal}>${p.totalVentas.toFixed(2)}</Text>
            </View>
            <View style={styles.productoGrid}>
              <GridItem label="Inicial" value={p.cantidadInicial} />
              <GridItem label="Entradas" value={`+${p.cantidadEntradas}`} color={palette.success} />
              <GridItem label="Final" value={p.cantidadFinal} />
              <GridItem label="Vendido" value={p.cantidadVendida} color={palette.accent} bold />
            </View>
            <Text style={styles.precioUnitario}>
              {p.cantidadVendida} unidades x ${p.precioUnitario.toFixed(2)}
            </Text>
          </Card>
        ))}

        {/* Gastos */}
        {resumen.totalGastos > 0 && (
          <>
            <Text style={styles.sectionLabel}>Gastos</Text>
            <Card style={styles.listaCard}>
              {resumen.productos.length > 0 && (
                <View style={styles.totalRow}>
                  <Ionicons name="cash-outline" size={18} color={palette.warning} />
                  <Text style={styles.totalLabel}>Total gastos</Text>
                  <Text style={[styles.totalValue, { color: palette.warning }]}>
                    -${resumen.totalGastos.toFixed(2)}
                  </Text>
                </View>
              )}
            </Card>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function GridItem({
  label, value, color, bold,
}: {
  label: string; value: string | number; color?: string; bold?: boolean;
}) {
  return (
    <View style={styles.gridItem}>
      <Text style={styles.gridLabel}>{label}</Text>
      <Text style={[
        styles.gridValue,
        color ? { color } : {},
        bold ? { fontWeight: '700' } : {},
      ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.surface0 },
  scroll: { padding: spacing.base, gap: spacing.md, paddingBottom: spacing['3xl'] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: fontSize.base, color: palette.textSecondary },

  horarioCard: {},
  horarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  horarioItem: { alignItems: 'center', gap: spacing.xs },
  horarioLabel: { fontSize: fontSize.xs, color: palette.textMuted },
  horarioHora: { fontSize: fontSize.lg, fontWeight: '700', color: palette.textPrimary },

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
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  saldoItem: { alignItems: 'center', gap: 2 },
  saldoItemLabel: { fontSize: fontSize.xs, color: palette.textMuted },
  saldoItemValue: { fontSize: fontSize.base, fontWeight: '700' },
  saldoDivider: { width: 1, height: 32, backgroundColor: palette.surface3 },

  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.xs,
  },

  productoCard: { gap: spacing.sm },
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
  productoGrid: {
    flexDirection: 'row',
    backgroundColor: palette.surface2,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  gridItem: { flex: 1, alignItems: 'center', gap: 2 },
  gridLabel: { fontSize: fontSize.xs, color: palette.textMuted },
  gridValue: { fontSize: fontSize.sm, fontWeight: '600', color: palette.textSecondary },
  precioUnitario: {
    fontSize: fontSize.xs,
    color: palette.textMuted,
    textAlign: 'right',
  },

  listaCard: { gap: spacing.sm },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  totalLabel: { flex: 1, fontSize: fontSize.base, color: palette.textSecondary },
  totalValue: { fontSize: fontSize.base, fontWeight: '700' },
});