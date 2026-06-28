// src/data/repositories/TurnoRepository.ts
import { ITurnoRepository } from '../../domain/repositories';
import { Turno, InventarioItem } from '../../domain/entities';
import { getDatabase } from '../database/database';

export class TurnoRepository implements ITurnoRepository {

  async crearTurno(turno: Turno): Promise<void> {
    const db = getDatabase();
    db.runSync(
      `INSERT INTO turnos (id, fechaInicio, fechaCierre, estado, notas)
       VALUES (?, ?, ?, ?, ?)`,
      [turno.id, turno.fechaInicio, turno.fechaCierre ?? null, turno.estado, turno.notas ?? null]
    );
  }

  async obtenerTurnoActivo(): Promise<Turno | null> {
    const db = getDatabase();
    const row = db.getFirstSync<Turno>(
      `SELECT * FROM turnos WHERE estado = 'activo' ORDER BY fechaInicio DESC LIMIT 1`
    );
    return row ?? null;
  }

  async obtenerTodos(): Promise<Turno[]> {
    const db = getDatabase();
    const rows = db.getAllSync<Turno>(
      `SELECT * FROM turnos ORDER BY fechaInicio DESC`
    );
    return rows;
  }

  async cerrarTurno(id: string, fechaCierre: string): Promise<void> {
    const db = getDatabase();
    db.runSync(
      `UPDATE turnos SET estado = 'cerrado', fechaCierre = ? WHERE id = ?`,
      [fechaCierre, id]
    );
  }

  async guardarInventarioItem(item: InventarioItem): Promise<void> {
    const db = getDatabase();
    db.runSync(
      `INSERT OR REPLACE INTO inventario_items
       (id, turnoId, productoId, productoNombre, productoPrecio, cantidad, tipo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [item.id, item.turnoId, item.productoId, item.productoNombre,
       item.productoPrecio, item.cantidad, item.tipo]
    );
  }

  async obtenerInventario(turnoId: string, tipo: 'inicial' | 'final'): Promise<InventarioItem[]> {
    const db = getDatabase();
    const rows = db.getAllSync<InventarioItem>(
      `SELECT * FROM inventario_items WHERE turnoId = ? AND tipo = ? ORDER BY productoNombre ASC`,
      [turnoId, tipo]
    );
    return rows;
  }

  async actualizarInventarioFinal(item: InventarioItem): Promise<void> {
    const db = getDatabase();
    db.runSync(
      `UPDATE inventario_items SET cantidad = ? WHERE turnoId = ? AND productoId = ? AND tipo = 'final'`,
      [item.cantidad, item.turnoId, item.productoId]
    );
  }

  async eliminarTurno(id: string): Promise<void> {
    const db = getDatabase();
    db.runSync(`DELETE FROM inventario_items WHERE turnoId = ?`, [id]);
    db.runSync(`DELETE FROM entradas WHERE turnoId = ?`, [id]);
    db.runSync(`DELETE FROM salidas_familiares_items WHERE salidaId IN (SELECT id FROM salidas_familiares WHERE turnoId = ?)`, [id]);
    db.runSync(`DELETE FROM salidas_familiares WHERE turnoId = ?`, [id]);
    db.runSync(`DELETE FROM gastos WHERE turnoId = ?`, [id]);
    db.runSync(`DELETE FROM mermas WHERE turnoId = ?`, [id]);
    db.runSync(`DELETE FROM cambios_precio WHERE turnoId = ?`, [id]);
    db.runSync(`DELETE FROM turnos WHERE id = ?`, [id]);
  }
}