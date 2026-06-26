// src/domain/entities/Turno.ts

export type EstadoTurno = 'activo' | 'cerrado';

export interface Turno {
  id: string;
  fechaInicio: string;    // ISO 8601 — ej: "2024-01-15T08:00:00.000Z"
  fechaCierre?: string;   // undefined mientras el turno está activo
  estado: EstadoTurno;
  notas?: string;
}