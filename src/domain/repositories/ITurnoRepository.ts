// src/domain/repositories/ITurnoRepository.ts
import { Turno } from '../entities';
import { InventarioItem } from '../entities';

export interface ITurnoRepository {
  crearTurno(turno: Turno): Promise<void>;
  obtenerTurnoActivo(): Promise<Turno | null>;
  obtenerTodos(): Promise<Turno[]>;
  cerrarTurno(id: string, fechaCierre: string): Promise<void>;
  guardarInventarioItem(item: InventarioItem): Promise<void>;
  obtenerInventario(turnoId: string, tipo: 'inicial' | 'final'): Promise<InventarioItem[]>;
  actualizarInventarioFinal(item: InventarioItem): Promise<void>;
}