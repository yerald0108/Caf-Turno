// app/(tabs)/productos.tsx
import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProductoStore, useTurnoStore } from '../../src/store';
import { Card, EmptyState, Badge, Button, AppTextInput } from '../../src/ui/components/common';
import { palette, fontSize, spacing, borderRadius, shadow } from '../../src/ui/theme';
import { Producto } from '../../src/domain/entities';
import { generateId } from '../../src/data/database/uuid';

export default function ProductosScreen() {
  const { productos, cargarProductos, guardarProducto, eliminarProducto } = useProductoStore();
  const { turnoActivo } = useTurnoStore();

  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('');
  const [saving, setSaving] = useState(false);

  // Estado para edición
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editPrecio, setEditPrecio] = useState('');
  const [editCategoria, setEditCategoria] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Campo requerido', 'El nombre del producto es obligatorio.');
      return;
    }
    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      Alert.alert('Precio inválido', 'Ingresa un precio válido mayor a 0.');
      return;
    }

    setSaving(true);
    const producto: Producto = {
      id: generateId(),
      nombre: nombre.trim(),
      precio: precioNum,
      categoria: categoria.trim() || undefined,
    };
    await guardarProducto(producto);
    setNombre('');
    setPrecio('');
    setCategoria('');
    setShowForm(false);
    setSaving(false);
  };

  const handleEliminar = (producto: Producto) => {
    Alert.alert(
      'Eliminar producto',
      `¿Eliminar "${producto.nombre}" del catálogo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarProducto(producto.id),
        },
      ]
    );
  };

  const handleAbrirEditar = (producto: Producto) => {
    setProductoEditando(producto);
    setEditNombre(producto.nombre);
    setEditPrecio(String(producto.precio));
    setEditCategoria(producto.categoria ?? '');
  };

  const handleGuardarEdicion = async () => {
    if (!productoEditando) return;
    if (!editNombre.trim()) {
      Alert.alert('Campo requerido', 'El nombre del producto es obligatorio.');
      return;
    }
    const precioNum = parseFloat(editPrecio);
    if (isNaN(precioNum) || precioNum <= 0) {
      Alert.alert('Precio inválido', 'Ingresa un precio válido mayor a 0.');
      return;
    }

    setEditSaving(true);
    const productoActualizado: Producto = {
      id: productoEditando.id,
      nombre: editNombre.trim(),
      precio: precioNum,
      categoria: editCategoria.trim() || undefined,
    };
    await guardarProducto(productoActualizado);
    setProductoEditando(null);
    setEditSaving(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Productos</Text>
          <Text style={styles.headerSub}>{productos.length} en catálogo</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Ionicons
            name={showForm ? 'close' : 'add'}
            size={24}
            color={palette.textInverse}
          />
        </TouchableOpacity>
      </View>

      {/* Formulario nuevo producto */}
      {showForm && (
        <Card style={styles.form}>
          <Text style={styles.formTitle}>Nuevo producto</Text>
          <AppTextInput
            label="Nombre"
            placeholder="Ej: Café con leche"
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
          />
          <AppTextInput
            label="Precio"
            placeholder="0.00"
            value={precio}
            onChangeText={setPrecio}
            keyboardType="decimal-pad"
          />
          <AppTextInput
            label="Categoría (opcional)"
            placeholder="Ej: Bebidas"
            value={categoria}
            onChangeText={setCategoria}
            autoCapitalize="words"
          />
          <Button
            label="Guardar producto"
            onPress={handleGuardar}
            loading={saving}
            fullWidth
          />
        </Card>
      )}

      {/* Lista */}
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="Sin productos"
            description="Agrega los productos de tu cafetería para poder usarlos en los turnos."
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.productoCard}>
            <View style={styles.productoRow}>
              <View style={styles.productoIconWrapper}>
                <Ionicons name="cube-outline" size={20} color={palette.accent} />
              </View>
              <View style={styles.productoInfo}>
                <Text style={styles.productoNombre}>{item.nombre}</Text>
                {item.categoria && (
                  <Badge label={item.categoria} variant="info" />
                )}
              </View>
              <View style={styles.productoRight}>
                <Text style={styles.productoPrecio}>
                  ${item.precio.toFixed(2)}
                </Text>
                <View style={styles.productoActions}>
                  {!turnoActivo && (
                    <TouchableOpacity
                      onPress={() => handleAbrirEditar(item)}
                      style={styles.editButton}
                    >
                      <Ionicons name="pencil-outline" size={16} color={palette.info} />
                    </TouchableOpacity>
                  )}
                  {!turnoActivo && (
                    <TouchableOpacity
                      onPress={() => handleEliminar(item)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={16} color={palette.danger} />
                    </TouchableOpacity>
                  )}
                  {turnoActivo && (
                    <View style={styles.turnoActivoBadge}>
                      <Ionicons name="lock-closed-outline" size={14} color={palette.textMuted} />
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Card>
        )}
      />

      {/* Modal de edición */}
      <Modal
        visible={productoEditando !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setProductoEditando(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar producto</Text>
              <TouchableOpacity
                onPress={() => setProductoEditando(null)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={palette.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <AppTextInput
                label="Nombre"
                placeholder="Nombre del producto"
                value={editNombre}
                onChangeText={setEditNombre}
                autoCapitalize="words"
              />
              <AppTextInput
                label="Precio"
                placeholder="0.00"
                value={editPrecio}
                onChangeText={setEditPrecio}
                keyboardType="decimal-pad"
              />
              <AppTextInput
                label="Categoría (opcional)"
                placeholder="Ej: Bebidas"
                value={editCategoria}
                onChangeText={setEditCategoria}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.modalFooter}>
              <Button
                label="Cancelar"
                onPress={() => setProductoEditando(null)}
                variant="secondary"
                style={styles.modalBtn}
              />
              <Button
                label="Guardar"
                onPress={handleGuardarEdicion}
                loading={editSaving}
                style={styles.modalBtn}
              />
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
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
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    margin: spacing.base,
    gap: spacing.md,
  },
  formTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  list: {
    padding: spacing.base,
    gap: spacing.sm,
    flexGrow: 1,
  },
  productoCard: {
    marginBottom: spacing.xs,
  },
  productoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: palette.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  productoInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  productoNombre: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  productoRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  productoPrecio: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: palette.accent,
  },
  productoActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  editButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.infoDim,
    borderRadius: borderRadius.sm,
  },
  deleteButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.dangerDim,
    borderRadius: borderRadius.sm,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: palette.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.base,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: palette.surface1,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: palette.surface3,
    overflow: 'hidden',
    ...shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: palette.surface3,
  },
  modalTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface2,
    borderRadius: borderRadius.full,
  },
  modalBody: {
    padding: spacing.base,
    gap: spacing.md,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: palette.surface3,
  },
  modalBtn: {
    flex: 1,
  },
  turnoActivoBadge: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface2,
    borderRadius: borderRadius.sm,
  },
});