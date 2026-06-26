// src/domain/repositories/IProductoRepository.ts
import { Producto } from '../entities';

export interface IProductoRepository {
  guardar(producto: Producto): Promise<void>;
  obtenerTodos(): Promise<Producto[]>;
  obtenerPorId(id: string): Promise<Producto | null>;
  eliminar(id: string): Promise<void>;
}