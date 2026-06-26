// src/store/useProductoStore.ts
import { create } from 'zustand';
import { Producto } from '../domain/entities';
import { ProductoRepository } from '../data/repositories';

const repo = new ProductoRepository();

interface ProductoState {
  productos: Producto[];
  cargarProductos: () => Promise<void>;
  guardarProducto: (producto: Producto) => Promise<void>;
  eliminarProducto: (id: string) => Promise<void>;
}

export const useProductoStore = create<ProductoState>((set, get) => ({
  productos: [],

  cargarProductos: async () => {
    const productos = await repo.obtenerTodos();
    set({ productos });
  },

  guardarProducto: async (producto) => {
    await repo.guardar(producto);
    await get().cargarProductos();
  },

  eliminarProducto: async (id) => {
    await repo.eliminar(id);
    set({ productos: get().productos.filter((p) => p.id !== id) });
  },
}));