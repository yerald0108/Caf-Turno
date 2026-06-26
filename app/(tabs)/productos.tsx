// app/(tabs)/productos.tsx
import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useProductoStore } from '../../src/store';
import { Card, EmptyState, Badge } from '../../src/ui/components/common';
import { palette, fontSize, spacing, borderRadius } from '../../src/ui/theme';
import { Producto } from '../../src/domain/entities';
import { generateId } from '../../src/data/database/uuid';
import { AppTextInput } from '../../src/ui/components/common';
import { Button } from '../../src/ui/components/common';

export default function ProductosScreen() {
  const { productos, cargarProductos, guardarProducto, eliminarProducto } = useProductoStore();
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('');
  const [saving, setSaving] = useState(false);

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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleEliminar = (producto: Producto) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowForm(!showForm);
          }}
        >
          <Ionicons
            name={showForm ? 'close' : 'add'}
            size={24}
            color={palette.textInverse}
          />
        </TouchableOpacity>
      </View>

      {/* Formulario */}
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
                <TouchableOpacity
                  onPress={() => handleEliminar(item)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={18} color={palette.danger} />
                </TouchableOpacity>
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
    justifyContent: 'space-between',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  productoPrecio: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: palette.accent,
  },
  deleteButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.dangerDim,
    borderRadius: borderRadius.sm,
  },
});