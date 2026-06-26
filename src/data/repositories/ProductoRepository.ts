// src/data/repositories/ProductoRepository.ts
import { IProductoRepository } from '../../domain/repositories';
import { Producto } from '../../domain/entities';
import { getDatabase } from '../database/database';

export class ProductoRepository implements IProductoRepository {

  async guardar(producto: Producto): Promise<void> {
    const db = getDatabase();
    db.runSync(
      `INSERT OR REPLACE INTO productos (id, nombre, precio, categoria)
       VALUES (?, ?, ?, ?)`,
      [producto.id, producto.nombre, producto.precio, producto.categoria ?? null]
    );
  }

  async obtenerTodos(): Promise<Producto[]> {
    const db = getDatabase();
    const rows = db.getAllSync<Producto>(
      `SELECT * FROM productos ORDER BY nombre ASC`
    );
    return rows;
  }

  async obtenerPorId(id: string): Promise<Producto | null> {
    const db = getDatabase();
    const row = db.getFirstSync<Producto>(
      `SELECT * FROM productos WHERE id = ?`,
      [id]
    );
    return row ?? null;
  }

  async eliminar(id: string): Promise<void> {
    const db = getDatabase();
    db.runSync(`DELETE FROM productos WHERE id = ?`, [id]);
  }
}