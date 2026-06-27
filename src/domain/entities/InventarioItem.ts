// src/domain/entities/InventarioItem.ts

export type TipoInventario = 'inicial' | 'final';

export interface InventarioItem {
  id: string;
  turnoId: string;
  productoId: string;
  productoNombre: string;
  productoPrecio: number;
  cantidad: number;
  tipo: TipoInventario;
}