// app/modals/entrada.tsx
import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTurnoStore, useMovimientosStore, useProductoStore } from '../../src/store';
import { ScreenHeader, Card, Button, AppTextInput } from '../../src/ui/components/common';
import { palette, fontSize, spacing, borderRadius } from '../../src/ui/theme';
import { EntradaProducto, Producto, InventarioItem } from '../../src/domain/entities';
import { generateId } from '../../src/data/database/uuid';
import { ProductoRepository, TurnoRepository } from '../../src/data/repositories';

const productoRepo = new ProductoRepository();
const turnoRepo = new TurnoRepository();

type Modo = 'existente' | 'nuevo';

export default function EntradaModal() {
  const { turnoActivo, inventarioInicial, cargarInventarioInicial } = useTurnoStore();
  const { agregarEntrada, entradas, cargarMovimientos } = useMovimientosStore();
  const { productos, cargarProductos } = useProductoStore();

  const [modo, setModo] = useState<Modo>('existente');
  const [productoSeleccionado, setProductoSeleccionado] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState('');
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);
  const [registradas, setRegistradas] = useState<EntradaProducto[]>([]);

  // Campos para nuevo producto
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [nuevaCantidadInicial, setNuevaCantidadInicial] = useState('');

  useEffect(() => {
    if (turnoActivo) cargarMovimientos(turnoActivo.id);
  }, [turnoActivo]);

  useEffect(() => {
    cargarProductos();
  }, []);

  const producto = productos.find((p) => p.id === productoSeleccionado);

  const handleGuardarExistente = async () => {
    if (!turnoActivo) return;
    if (!productoSeleccionado || !producto) {
      Alert.alert('Selecciona un producto');
      return;
    }
    const cantNum = parseFloat(cantidad);
    if (isNaN(cantNum) || cantNum <= 0) {
      Alert.alert('Cantidad inválida', 'Ingresa una cantidad válida mayor a 0.');
      return;
    }

    setSaving(true);
    try {
      const entrada: EntradaProducto = {
        id: generateId(),
        turnoId: turnoActivo.id,
        productoId: producto.id,
        productoNombre: producto.nombre,
        productoPrecio: producto.precio,
        cantidad: cantNum,
        fecha: new Date().toISOString(),
        notas: notas.trim() || undefined,
      };
      await agregarEntrada(entrada);
      setRegistradas((prev) => [entrada, ...prev]);
      setProductoSeleccionado(null);
      setCantidad('');
      setNotas('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar la entrada. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleGuardarNuevo = async () => {
    if (!turnoActivo) return;
    if (!nuevoNombre.trim()) {
      Alert.alert('Nombre requerido', 'Escribe el nombre del producto.');
      return;
    }
    const precioNum = parseFloat(nuevoPrecio);
    if (isNaN(precioNum) || precioNum <= 0) {
      Alert.alert('Precio inválido', 'Ingresa un precio válido.');
      return;
    }
    const cantInicialNum = parseFloat(nuevaCantidadInicial) || 0;
    const cantEntradaNum = parseFloat(cantidad) || 0;

    setSaving(true);
    try {
      const nuevoProducto: Producto = {
        id: generateId(),
        nombre: nuevoNombre.trim(),
        precio: precioNum,
        categoria: nuevaCategoria.trim() || undefined,
      };
      await productoRepo.guardar(nuevoProducto);

      const itemInicial: InventarioItem = {
        id: generateId(),
        turnoId: turnoActivo.id,
        productoId: nuevoProducto.id,
        productoNombre: nuevoProducto.nombre,
        productoPrecio: nuevoProducto.precio,
        cantidad: cantInicialNum,
        tipo: 'inicial',
      };
      await turnoRepo.guardarInventarioItem(itemInicial);

      if (cantEntradaNum > 0) {
        const entrada: EntradaProducto = {
          id: generateId(),
          turnoId: turnoActivo.id,
          productoId: nuevoProducto.id,
          productoNombre: nuevoProducto.nombre,
          productoPrecio: nuevoProducto.precio,
          cantidad: cantEntradaNum,
          fecha: new Date().toISOString(),
          notas: notas.trim() || undefined,
        };
        await agregarEntrada(entrada);
        setRegistradas((prev) => [entrada, ...prev]);
      }

      await cargarInventarioInicial(turnoActivo.id);
      await cargarProductos();

      setNuevoNombre('');
      setNuevoPrecio('');
      setNuevaCategoria('');
      setNuevaCantidadInicial('');
      setCantidad('');
      setNotas('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el producto. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Entrada de producto" showBack />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Selector de modo */}
        <View style={styles.modoRow}>
          <TouchableOpacity
            style={[styles.modoBtn, modo === 'existente' && styles.modoBtnActive]}
            onPress={() => setModo('existente')}
          >
            <Text style={[styles.modoBtnLabel, modo === 'existente' && styles.modoBtnLabelActive]}>
              Producto existente
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modoBtn, modo === 'nuevo' && styles.modoBtnActive]}
            onPress={() => setModo('nuevo')}
          >
            <Text style={[styles.modoBtnLabel, modo === 'nuevo' && styles.modoBtnLabelActive]}>
              Producto nuevo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modo: producto existente */}
        {modo === 'existente' && (
          <>
            <Text style={styles.sectionLabel}>Selecciona el producto</Text>
            {productos.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.productoItem,
                  productoSeleccionado === p.id && styles.productoItemSelected,
                ]}
                onPress={() => setProductoSeleccionado(p.id)}
              >
                <View style={styles.productoItemInfo}>
                  <Text style={styles.productoItemNombre}>{p.nombre}</Text>
                  <Text style={styles.productoItemPrecio}>${p.precio.toFixed(2)}</Text>
                </View>
                {productoSeleccionado === p.id && (
                  <Ionicons name="checkmark-circle" size={22} color={palette.success} />
                )}
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionLabel}>Cantidad que entra</Text>
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

            <AppTextInput
              label="Notas (opcional)"
              placeholder="Ej: Llegó del proveedor"
              value={notas}
              onChangeText={setNotas}
              multiline
              numberOfLines={2}
            />

            <Button
              label="Registrar entrada"
              onPress={handleGuardarExistente}
              loading={saving}
              fullWidth
              style={styles.saveBtn}
            />
          </>
        )}

        {/* Modo: producto nuevo */}
        {modo === 'nuevo' && (
          <>
            <Card style={styles.nuevoCard}>
              <Text style={styles.nuevoCardTitle}>Datos del nuevo producto</Text>
              <AppTextInput
                label="Nombre"
                placeholder="Ej: Café con leche"
                value={nuevoNombre}
                onChangeText={setNuevoNombre}
                autoCapitalize="words"
              />
              <AppTextInput
                label="Precio de venta"
                placeholder="0.00"
                value={nuevoPrecio}
                onChangeText={setNuevoPrecio}
                keyboardType="decimal-pad"
              />
              <AppTextInput
                label="Categoría (opcional)"
                placeholder="Ej: Bebidas"
                value={nuevaCategoria}
                onChangeText={setNuevaCategoria}
                autoCapitalize="words"
              />
              <AppTextInput
                label="Cantidad inicial en inventario"
                placeholder="¿Cuántos había al inicio del turno?"
                value={nuevaCantidadInicial}
                onChangeText={setNuevaCantidadInicial}
                keyboardType="decimal-pad"
              />
            </Card>

            <Text style={styles.sectionLabel}>Cantidad que entra ahora (opcional)</Text>
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

            <AppTextInput
              label="Notas (opcional)"
              placeholder="Observaciones"
              value={notas}
              onChangeText={setNotas}
              multiline
              numberOfLines={2}
            />

            <Button
              label="Agregar al inventario"
              onPress={handleGuardarNuevo}
              loading={saving}
              fullWidth
              style={styles.saveBtn}
            />
          </>
        )}

        {/* Entradas registradas en esta sesión */}
        {registradas.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Registradas en esta sesión</Text>
            {registradas.map((e) => (
              <Card key={e.id} style={styles.registradaCard}>
                <View style={styles.registradaRow}>
                  <Ionicons name="checkmark-circle" size={18} color={palette.success} />
                  <Text style={styles.registradaNombre}>{e.productoNombre}</Text>
                  <Text style={styles.registradaCant}>+{e.cantidad}</Text>
                </View>
              </Card>
            ))}
          </>
        )}

        {entradas.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Entradas del turno</Text>
            {entradas.map((e) => (
              <Card key={e.id} style={styles.registradaCard}>
                <View style={styles.registradaRow}>
                  <Ionicons name="arrow-down-circle" size={18} color={palette.success} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.registradaNombre}>{e.productoNombre}</Text>
                    <Text style={styles.registradaFecha}>
                      {new Date(e.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      {e.notas ? ` · ${e.notas}` : ''}
                    </Text>
                  </View>
                  <Text style={styles.registradaCant}>+{e.cantidad}</Text>
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
  modoRow: {
    flexDirection: 'row',
    backgroundColor: palette.surface2,
    borderRadius: borderRadius.md,
    padding: 4,
    gap: 4,
  },
  modoBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  modoBtnActive: {
    backgroundColor: palette.surface0,
    borderWidth: 1,
    borderColor: palette.accent,
  },
  modoBtnLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: palette.textMuted,
  },
  modoBtnLabelActive: {
    color: palette.accent,
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
    borderColor: palette.success,
    backgroundColor: palette.successDim,
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
    color: palette.accent,
    marginTop: 2,
  },
  cantidadInput: {
    height: 56,
    color: palette.textPrimary,
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    textAlign: 'center',
  },
  nuevoCard: { 
    gap: spacing.md 
  },
  nuevoCardTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  saveBtn: { 
    marginTop: spacing.sm 
  },
  registradaCard: { 
    marginBottom: spacing.xs 
  },
  registradaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  registradaNombre: {
    flex: 1,
    fontSize: fontSize.base,
    color: palette.textSecondary,
  },
  registradaCant: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: palette.success,
  },
  registradaFecha: {
    fontSize: fontSize.xs,
    color: palette.textMuted,
    marginTop: 2,
} ,
});