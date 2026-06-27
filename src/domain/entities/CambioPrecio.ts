// src/domain/entities/CambioPrecio.ts

export interface CambioPrecio {
  id: string;
  turnoId: string;
  productoId: string;
  productoNombre: string;
  precioAnterior: number;
  precioNuevo: number;
  cantidadVendidaAnterior: number;  // vendido manualmente al precio viejo
  cantidadRestante: number;          // quedan por vender al precio nuevo
  fecha: string;
}