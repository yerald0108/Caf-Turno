// src/domain/entities/InventarioItem.ts

export type TipoInventario = 'inicial' | 'final';

export interface InventarioItem {
  id: string;
  turnoId: string;
  productoId: string;
  productoNombre: string;   // desnormalizado para mostrarlo sin joins
  productoPrecio: number;   // precio al momento del turno
  cantidad: number;
  tipo: TipoInventario;
}