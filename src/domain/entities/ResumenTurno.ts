// src/domain/entities/ResumenTurno.ts

export interface ResumenProducto {
  productoId: string;
  productoNombre: string;
  precioUnitario: number;
  cantidadInicial: number;
  cantidadEntradas: number;
  cantidadFinal: number;
  cantidadVendida: number;   // inicial + entradas - final - mermas - salidas
  totalVentas: number;       // cantidadVendida * precioUnitario
}

export interface ResumenTurno {
  turnoId: string;
  fechaInicio: string;
  fechaCierre: string;
  productos: ResumenProducto[];
  totalBruto: number;        // suma de todas las ventas
  totalGastos: number;       // suma de todos los gastos
  totalSalidaFamiliar: number; // cantidad de items (no tiene valor monetario)
  saldoEsperadoCaja: number; // totalBruto - totalGastos
}