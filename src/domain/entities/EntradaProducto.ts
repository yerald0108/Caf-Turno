// src/domain/entities/EntradaProducto.ts

export interface EntradaProducto {
  id: string;
  turnoId: string;
  productoId: string;
  productoNombre: string;
  productoPrecio: number;
  cantidad: number;
  fecha: string;           // ISO 8601
  notas?: string;
}