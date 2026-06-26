// src/domain/entities/Merma.ts

export type MotivoMerma = 'vencido' | 'roto' | 'otro';

export interface Merma {
  id: string;
  turnoId: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  motivo: MotivoMerma;
  descripcion?: string;    // obligatorio cuando motivo === 'otro'
  fecha: string;
}