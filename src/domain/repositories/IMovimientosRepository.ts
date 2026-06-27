// src/domain/repositories/IMovimientosRepository.ts
import { EntradaProducto, SalidaFamiliar, Gasto, Merma, CambioPrecio } from '../entities';

export interface IMovimientosRepository {
  // Entradas
  guardarEntrada(entrada: EntradaProducto): Promise<void>;
  obtenerEntradas(turnoId: string): Promise<EntradaProducto[]>;

  // Salidas familiares
  guardarSalidaFamiliar(salida: SalidaFamiliar): Promise<void>;
  obtenerSalidasFamiliares(turnoId: string): Promise<SalidaFamiliar[]>;

  // Gastos
  guardarGasto(gasto: Gasto): Promise<void>;
  obtenerGastos(turnoId: string): Promise<Gasto[]>;

  // Mermas
  guardarMerma(merma: Merma): Promise<void>;
  obtenerMermas(turnoId: string): Promise<Merma[]>;

  // Cambios de precio
  guardarCambioPrecio(cambio: CambioPrecio): Promise<void>;
  obtenerCambiosPrecio(turnoId: string): Promise<CambioPrecio[]>;
}