// app/(tabs)/historial.tsx
import { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTurnoStore } from '../../src/store';
import { Card, Badge, EmptyState } from '../../src/ui/components/common';
import { palette, fontSize, spacing, borderRadius } from '../../src/ui/theme';
import { Turno } from '../../src/domain/entities';

export default function HistorialScreen() {
  const { historial, cargarHistorial, eliminarTurno } = useTurnoStore();

  useFocusEffect(
    useCallback(() => {
      cargarHistorial();
    }, [])
  );

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

  const handleEliminar = (turno: Turno) => {
    const esActivo = turno.estado === 'activo';
    Alert.alert(
      'Eliminar turno',
      esActivo
        ? '⚠️ Este turno está ACTIVO. Eliminarlo cerrará el turno sin guardar el resumen. ¿Continuar?'
        : `¿Eliminar el turno del ${formatFecha(turno.fechaInicio)}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarTurno(turno.id),
        },
      ]
    );
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
          <Card style={styles.turnoCard}>
            <View style={styles.turnoHeader}>
              <TouchableOpacity
                style={styles.turnoFecha}
                onPress={() => {
                  router.push(`/turno/detalle?id=${item.id}`);
                }}
              >
                <View style={[
                  styles.estadoDot,
                  { backgroundColor: item.estado === 'activo' ? palette.success : palette.textMuted }
                ]} />
                <Text style={styles.fechaText}>
                  {formatFecha(item.fechaInicio)}
                </Text>
              </TouchableOpacity>
              <View style={styles.turnoHeaderRight}>
                <Badge
                  label={item.estado === 'activo' ? 'Activo' : 'Cerrado'}
                  variant={item.estado === 'activo' ? 'success' : 'neutral'}
                />
                <TouchableOpacity
                  onPress={() => handleEliminar(item)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={16} color={palette.danger} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push(`/turno/detalle?id=${item.id}`)}
                  style={styles.chevronBtn}
                >
                  <Ionicons name="chevron-forward" size={16} color={palette.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.turnoDetalle}>
              <View style={styles.detalleItem}>
                <Ionicons name="play-outline" size={13} color={palette.textMuted} />
                <Text style={styles.detalleLabel}>Inicio</Text>
                <Text style={styles.detalleValue}>{formatHora(item.fechaInicio)}</Text>
              </View>
              {item.fechaCierre && (
                <View style={styles.detalleItem}>
                  <Ionicons name="stop-outline" size={13} color={palette.textMuted} />
                  <Text style={styles.detalleLabel}>Cierre</Text>
                  <Text style={styles.detalleValue}>{formatHora(item.fechaCierre)}</Text>
                </View>
              )}
              <View style={styles.detalleItem}>
                <Ionicons name="time-outline" size={13} color={palette.textMuted} />
                <Text style={styles.detalleLabel}>Duración</Text>
                <Text style={styles.detalleValue}>{getDuracion(item)}</Text>
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
  estadoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.dangerDim,
    borderRadius: borderRadius.sm,
  },
  chevronBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});