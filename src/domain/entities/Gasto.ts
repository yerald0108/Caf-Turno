// src/domain/entities/Gasto.ts

export interface Gasto {
  id: string;
  turnoId: string;
  descripcion: string;
  monto: number;           // siempre positivo — se descuenta al calcular
  fecha: string;
  notas?: string;
}