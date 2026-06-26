// src/domain/entities/SalidaFamiliar.ts

export interface SalidaFamiliarItem {
  productoId: string;
  productoNombre: string;
  cantidad: number;
}

export interface SalidaFamiliar {
  id: string;
  turnoId: string;
  persona: string;                  // quién retiró los productos
  items: SalidaFamiliarItem[];      // lista de productos retirados
  fecha: string;
  notas?: string;
}