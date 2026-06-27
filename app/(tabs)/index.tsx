// app/(tabs)/index.tsx
import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useFadeIn } from '../../src/ui/hooks/useFadeIn';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTurnoStore } from '../../src/store';
import { useMovimientosStore } from '../../src/store';
import { Card, Badge } from '../../src/ui/components/common';
import { palette, fontSize, spacing, borderRadius, shadow } from '../../src/ui/theme';

export default function TurnoScreen() {
  const { turnoActivo, inventarioInicial, cargarTurnoActivo, cargarInventarioInicial } = useTurnoStore();
  const { entradas, gastos, salidasFamiliares, mermas, cargarMovimientos } = useMovimientosStore();
  const { opacity: fadeOpacity, translateY: fadeY } = useFadeIn(400);

  useEffect(() => {
    cargarTurnoActivo();
  }, []);

  useEffect(() => {
    if (turnoActivo) {
      cargarInventarioInicial(turnoActivo.id);
      cargarMovimientos(turnoActivo.id);
    }
  }, [turnoActivo]);

  const formatFecha = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
  };

  const formatHora = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // Sin turno activo
  if (!turnoActivo) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>CaféTurno</Text>
            <Text style={styles.headerSub}>Bienvenido</Text>
          </View>
          <Badge label="Sin turno" variant="neutral" />
        </View>
        <View style={styles.emptyTurno}>
          <View style={styles.emptyIconRing}>
            <View style={styles.emptyIconInner}>
              <Ionicons name="storefront-outline" size={40} color={palette.accent} />
            </View>
          </View>
          <View style={styles.emptyTexts}>
            <Text style={styles.emptyTitle}>Sin turno activo</Text>
            <Text style={styles.emptyDesc}>
              Inicia un nuevo turno para comenzar a registrar el inventario de tu cafetería.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/turno/nuevo')}
            activeOpacity={0.85}
          >
            <Ionicons name="play-circle" size={20} color={palette.textInverse} />
            <Text style={styles.startButtonLabel}>Iniciar turno</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Con turno activo
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>CaféTurno</Text>
          <Text style={styles.headerSub}>{formatFecha(turnoActivo.fechaInicio)}</Text>
        </View>
        <Badge label="Turno activo" variant="success" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeOpacity, transform: [{ translateY: fadeY }] }}>
          {/* Info del turno */}
          <Card style={styles.turnoCard} elevated>
            <View style={styles.turnoCardRow}>
              <View style={styles.turnoCardItem}>
                <Text style={styles.turnoCardLabel}>Inicio</Text>
                <Text style={styles.turnoCardValue}>{formatHora(turnoActivo.fechaInicio)}</Text>
              </View>
              <View style={styles.turnoCardDivider} />
              <View style={styles.turnoCardItem}>
                <Text style={styles.turnoCardLabel}>Productos</Text>
                <Text style={styles.turnoCardValue}>{inventarioInicial.length}</Text>
              </View>
              <View style={styles.turnoCardDivider} />
              <View style={styles.turnoCardItem}>
                <Text style={styles.turnoCardLabel}>Movimientos</Text>
                <Text style={styles.turnoCardValue}>
                  {entradas.length + salidasFamiliares.length + gastos.length + mermas.length}
                </Text>
              </View>
            </View>
          </Card>

          <TouchableOpacity
            style={styles.inventarioBtn}
            onPress={() => router.push('/turno/inventario-inicial')}
          >
            <Ionicons name="list-outline" size={18} color={palette.textSecondary} />
            <Text style={styles.inventarioBtnLabel}>Ver inventario inicial</Text>
            <Ionicons name="chevron-forward" size={16} color={palette.textMuted} />
          </TouchableOpacity>

          {/* Acciones rápidas */}
          <Text style={styles.sectionTitle}>Registrar movimiento</Text>
          <View style={styles.actionsGrid}>
            <ActionButton
              icon="arrow-down-circle"
              label="Entrada"
              color={palette.success}
              dimColor={palette.successDim}
              onPress={() => router.push('/modals/entrada')}
            />
            <ActionButton
              icon="people"
              label="Salida familiar"
              color={palette.info}
              dimColor={palette.infoDim}
              onPress={() => router.push('/modals/salida-familiar')}
            />
            <ActionButton
              icon="cash"
              label="Gasto"
              color={palette.warning}
              dimColor={palette.warningDim}
              onPress={() => router.push('/modals/gasto')}
            />
            <ActionButton
              icon="warning"
              label="Merma"
              color={palette.danger}
              dimColor={palette.dangerDim}
              onPress={() => router.push('/modals/merma')}
            />
            <ActionButton
              icon="pricetag"
              label="Cambio de precio"
              color={palette.accent}
              dimColor={palette.accentDim}
              onPress={() => router.push('/modals/cambio-precio')}
            />
          </View>

          {/* Resumen de movimientos */}
          <Text style={styles.sectionTitle}>Resumen del turno</Text>
          <Card style={styles.resumenCard}>
            <ResumenRow icon="arrow-down-circle" label="Entradas" value={entradas.length} color={palette.success} />
            <ResumenRow icon="people" label="Salidas familiares" value={salidasFamiliares.length} color={palette.info} />
            <ResumenRow icon="cash" label="Gastos" value={`$${gastos.reduce((a, g) => a + g.monto, 0).toFixed(2)}`} color={palette.warning} />
            <ResumenRow icon="warning" label="Mermas" value={mermas.length} color={palette.danger} />
          </Card>

          {/* Cerrar turno */}
          <TouchableOpacity
            style={styles.cerrarButton}
            onPress={() => {
              router.push('/turno/cierre');
            }}
          >
            <Ionicons name="stop-circle" size={20} color={palette.danger} />
            <Text style={styles.cerrarLabel}>Cerrar turno</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({
  icon, label, color, dimColor, onPress,
}: {
  icon: string; label: string; color: string; dimColor: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, { backgroundColor: dimColor, borderColor: color + '40' }]}
      onPress={() => {
        onPress();
      }}
      activeOpacity={0.75}
    >
      <View style={[styles.actionIconWrapper, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={26} color={color} />
      </View>
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ResumenRow({
  icon, label, value, color,
}: {
  icon: string; label: string; value: string | number; color: string;
}) {
  return (
    <View style={styles.resumenRow}>
      <Ionicons name={icon as any} size={18} color={color} />
      <Text style={styles.resumenLabel}>{label}</Text>
      <Text style={[styles.resumenValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.surface0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.surface3,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: palette.textPrimary,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: fontSize.sm,
    color: palette.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  scroll: {
    padding: spacing.base,
    gap: spacing.md,
    paddingBottom: spacing['3xl'],
  },

  // Sin turno
  emptyTurno: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    gap: spacing.md,
  },
  emptyIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: palette.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: palette.textPrimary,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: fontSize.base,
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
    ...shadow.md,
  },
  startButtonLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: palette.textInverse,
  },

  // Con turno activo
  turnoCard: {
    marginBottom: spacing.xs,
  },
  turnoCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  turnoCardItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  turnoCardLabel: {
    fontSize: fontSize.xs,
    color: palette.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  turnoCardValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  turnoCardDivider: {
    width: 1,
    height: 40,
    backgroundColor: palette.surface3,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.xs,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionBtn: {
    width: '47.5%',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.base,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  actionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  resumenCard: {
    gap: spacing.sm,
  },
  resumenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  resumenLabel: {
    flex: 1,
    fontSize: fontSize.base,
    color: palette.textSecondary,
  },
  resumenValue: {
    fontSize: fontSize.base,
    fontWeight: '700',
  },
  cerrarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: palette.danger,
    backgroundColor: palette.dangerDim,
    marginTop: spacing.sm,
  },
  cerrarLabel: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: palette.danger,
  },
  inventarioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.surface1,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: palette.surface3,
    padding: spacing.base,
  },
  inventarioBtnLabel: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: '500',
    color: palette.textSecondary,
  },
  emptyIconRing: {
  width: 120,
  height: 120,
  borderRadius: 60,
  borderWidth: 1,
  borderColor: palette.accent + '30',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: palette.accentDim,
},
  emptyIconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTexts: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});