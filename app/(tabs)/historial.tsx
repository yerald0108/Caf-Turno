// app/(tabs)/historial.tsx
import { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTurnoStore } from '../../src/store';
import { Card, Badge, EmptyState } from '../../src/ui/components/common';
import { palette, fontSize, spacing, borderRadius } from '../../src/ui/theme';
import { Turno } from '../../src/domain/entities';

export default function HistorialScreen() {
  const { historial, cargarHistorial } = useTurnoStore();

  useEffect(() => {
    cargarHistorial();
  }, []);

  const formatFecha = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  const formatHora = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const getDuracion = (turno: Turno) => {
    if (!turno.fechaCierre) return 'En curso';
    const inicio = new Date(turno.fechaInicio).getTime();
    const cierre = new Date(turno.fechaCierre).getTime();
    const mins = Math.floor((cierre - inicio) / 60000);
    const horas = Math.floor(mins / 60);
    const minutos = mins % 60;
    return horas > 0 ? `${horas}h ${minutos}m` : `${minutos}m`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial</Text>
        <Text style={styles.headerSub}>{historial.length} turnos registrados</Text>
      </View>

      <FlatList
        data={historial}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="time-outline"
            title="Sin historial"
            description="Los turnos cerrados aparecerán aquí."
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/turno/detalle?id=${item.id}`);
            }}
          >
            <Card style={styles.turnoCard}>
              <View style={styles.turnoHeader}>
                <View style={styles.turnoFecha}>
                  <Ionicons name="calendar-outline" size={16} color={palette.textMuted} />
                  <Text style={styles.fechaText}>
                    {formatFecha(item.fechaInicio)}
                  </Text>
                </View>
                <View style={styles.turnoHeaderRight}>
                  <Badge
                    label={item.estado === 'activo' ? 'Activo' : 'Cerrado'}
                    variant={item.estado === 'activo' ? 'success' : 'neutral'}
                  />
                  <Ionicons name="chevron-forward" size={16} color={palette.textMuted} />
                </View>
              </View>

              <View style={styles.turnoDetalle}>
                <View style={styles.detalleItem}>
                  <Ionicons name="play-outline" size={14} color={palette.textMuted} />
                  <Text style={styles.detalleLabel}>Inicio</Text>
                  <Text style={styles.detalleValue}>{formatHora(item.fechaInicio)}</Text>
                </View>
                {item.fechaCierre && (
                  <View style={styles.detalleItem}>
                    <Ionicons name="stop-outline" size={14} color={palette.textMuted} />
                    <Text style={styles.detalleLabel}>Cierre</Text>
                    <Text style={styles.detalleValue}>{formatHora(item.fechaCierre)}</Text>
                  </View>
                )}
                <View style={styles.detalleItem}>
                  <Ionicons name="time-outline" size={14} color={palette.textMuted} />
                  <Text style={styles.detalleLabel}>Duración</Text>
                  <Text style={styles.detalleValue}>{getDuracion(item)}</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.surface0 },
  header: {
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
  },
  list: {
    padding: spacing.base,
    gap: spacing.sm,
    flexGrow: 1,
  },
  turnoCard: { gap: spacing.md },
  turnoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  turnoHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  turnoFecha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fechaText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: palette.textPrimary,
    textTransform: 'capitalize',
  },
  turnoDetalle: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: palette.surface2,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  detalleItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  detalleLabel: {
    fontSize: fontSize.xs,
    color: palette.textMuted,
  },
  detalleValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: palette.textPrimary,
  },
});