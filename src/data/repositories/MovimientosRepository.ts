// src/data/repositories/MovimientosRepository.ts
import { IMovimientosRepository } from '../../domain/repositories';
import { EntradaProducto, SalidaFamiliar, Gasto, Merma } from '../../domain/entities';
import { getDatabase } from '../database/database';
import { generateId } from '../database/uuid';

export class MovimientosRepository implements IMovimientosRepository {

  // ── Entradas ──────────────────────────────────────────────
  async guardarEntrada(entrada: EntradaProducto): Promise<void> {
    const db = getDatabase();
    db.runSync(
      `INSERT INTO entradas
       (id, turnoId, productoId, productoNombre, productoPrecio, cantidad, fecha, notas)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [entrada.id, entrada.turnoId, entrada.productoId, entrada.productoNombre,
       entrada.productoPrecio, entrada.cantidad, entrada.fecha, entrada.notas ?? null]
    );
  }

  async obtenerEntradas(turnoId: string): Promise<EntradaProducto[]> {
    const db = getDatabase();
    return db.getAllSync<EntradaProducto>(
      `SELECT * FROM entradas WHERE turnoId = ? ORDER BY fecha DESC`,
      [turnoId]
    );
  }

  // ── Salidas familiares ────────────────────────────────────
  async guardarSalidaFamiliar(salida: SalidaFamiliar): Promise<void> {
    const db = getDatabase();

    db.runSync(
      `INSERT INTO salidas_familiares (id, turnoId, persona, fecha, notas)
       VALUES (?, ?, ?, ?, ?)`,
      [salida.id, salida.turnoId, salida.persona, salida.fecha, salida.notas ?? null]
    );

    for (const item of salida.items) {
      db.runSync(
        `INSERT INTO salidas_familiares_items
         (id, salidaId, productoId, productoNombre, cantidad)
         VALUES (?, ?, ?, ?, ?)`,
        [generateId(), salida.id, item.productoId, item.productoNombre, item.cantidad]
      );
    }
  }

  async obtenerSalidasFamiliares(turnoId: string): Promise<SalidaFamiliar[]> {
    const db = getDatabase();

    const salidas = db.getAllSync<Omit<SalidaFamiliar, 'items'>>(
      `SELECT * FROM salidas_familiares WHERE turnoId = ? ORDER BY fecha DESC`,
      [turnoId]
    );

    return salidas.map((salida) => {
      const items = db.getAllSync<{ productoId: string; productoNombre: string; cantidad: number }>(
        `SELECT productoId, productoNombre, cantidad
         FROM salidas_familiares_items WHERE salidaId = ?`,
        [salida.id]
      );
      return { ...salida, items };
    });
  }

  // ── Gastos ────────────────────────────────────────────────
  async guardarGasto(gasto: Gasto): Promise<void> {
    const db = getDatabase();
    db.runSync(
      `INSERT INTO gastos (id, turnoId, descripcion, monto, fecha, notas)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [gasto.id, gasto.turnoId, gasto.descripcion, gasto.monto, gasto.fecha, gasto.notas ?? null]
    );
  }

  async obtenerGastos(turnoId: string): Promise<Gasto[]> {
    const db = getDatabase();
    return db.getAllSync<Gasto>(
      `SELECT * FROM gastos WHERE turnoId = ? ORDER BY fecha DESC`,
      [turnoId]
    );
  }

  // ── Mermas ────────────────────────────────────────────────
  async guardarMerma(merma: Merma): Promise<void> {
    const db = getDatabase();
    db.runSync(
      `INSERT INTO mermas
       (id, turnoId, productoId, productoNombre, cantidad, motivo, descripcion, fecha)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [merma.id, merma.turnoId, merma.productoId, merma.productoNombre,
       merma.cantidad, merma.motivo, merma.descripcion ?? null, merma.fecha]
    );
  }

  async obtenerMermas(turnoId: string): Promise<Merma[]> {
    const db = getDatabase();
    return db.getAllSync<Merma>(
      `SELECT * FROM mermas WHERE turnoId = ? ORDER BY fecha DESC`,
      [turnoId]
    );
  }
}