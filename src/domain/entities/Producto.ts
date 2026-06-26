// src/domain/entities/Producto.ts

export interface Producto {
  id: string;
  nombre: string;
  precio: number;        // precio de venta unitario
  categoria?: string;    // opcional para agrupar en pantalla
}