// src/store/useMovimientosStore.ts
import { create } from 'zustand';
import { EntradaProducto, SalidaFamiliar, Gasto, Merma } from '../domain/entities';
import { MovimientosRepository } from '../data/repositories';

const repo = new MovimientosRepository();

interface MovimientosState {
  entradas: EntradaProducto[];
  salidasFamiliares: SalidaFamiliar[];
  gastos: Gasto[];
  mermas: Merma[];

  cargarMovimientos: (turnoId: string) => Promise<void>;
  agregarEntrada: (entrada: EntradaProducto) => Promise<void>;
  agregarSalidaFamiliar: (salida: SalidaFamiliar) => Promise<void>;
  agregarGasto: (gasto: Gasto) => Promise<void>;
  agregarMerma: (merma: Merma) => Promise<void>;
}

export const useMovimientosStore = create<MovimientosState>((set, get) => ({
  entradas: [],
  salidasFamiliares: [],
  gastos: [],
  mermas: [],

  cargarMovimientos: async (turnoId) => {
    const [entradas, salidasFamiliares, gastos, mermas] = await Promise.all([
      repo.obtenerEntradas(turnoId),
      repo.obtenerSalidasFamiliares(turnoId),
      repo.obtenerGastos(turnoId),
      repo.obtenerMermas(turnoId),
    ]);
    set({ entradas, salidasFamiliares, gastos, mermas });
  },

  agregarEntrada: async (entrada) => {
    await repo.guardarEntrada(entrada);
    set({ entradas: [entrada, ...get().entradas] });
  },

  agregarSalidaFamiliar: async (salida) => {
    await repo.guardarSalidaFamiliar(salida);
    set({ salidasFamiliares: [salida, ...get().salidasFamiliares] });
  },

  agregarGasto: async (gasto) => {
    await repo.guardarGasto(gasto);
    set({ gastos: [gasto, ...get().gastos] });
  },

  agregarMerma: async (merma) => {
    await repo.guardarMerma(merma);
    set({ mermas: [merma, ...get().mermas] });
  },
}));