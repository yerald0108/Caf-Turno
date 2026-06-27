// src/store/useMovimientosStore.ts
import { create } from 'zustand';
import { EntradaProducto, SalidaFamiliar, Gasto, Merma, CambioPrecio } from '../domain/entities';
import { MovimientosRepository } from '../data/repositories';

const repo = new MovimientosRepository();

interface MovimientosState {
  entradas: EntradaProducto[];
  salidasFamiliares: SalidaFamiliar[];
  gastos: Gasto[];
  mermas: Merma[];
  cambiosPrecio: CambioPrecio[];

  cargarMovimientos: (turnoId: string) => Promise<void>;
  agregarEntrada: (entrada: EntradaProducto) => Promise<void>;
  agregarSalidaFamiliar: (salida: SalidaFamiliar) => Promise<void>;
  agregarGasto: (gasto: Gasto) => Promise<void>;
  agregarMerma: (merma: Merma) => Promise<void>;
  agregarCambioPrecio: (cambio: CambioPrecio) => Promise<void>;
}

export const useMovimientosStore = create<MovimientosState>((set, get) => ({
  entradas: [],
  salidasFamiliares: [],
  gastos: [],
  mermas: [],
  cambiosPrecio: [],

  cargarMovimientos: async (turnoId) => {
    const [entradas, salidasFamiliares, gastos, mermas, cambiosPrecio] = await Promise.all([
      repo.obtenerEntradas(turnoId),
      repo.obtenerSalidasFamiliares(turnoId),
      repo.obtenerGastos(turnoId),
      repo.obtenerMermas(turnoId),
      repo.obtenerCambiosPrecio(turnoId),
    ]);
    set({ entradas, salidasFamiliares, gastos, mermas, cambiosPrecio });
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

  agregarCambioPrecio: async (cambio) => {
    await repo.guardarCambioPrecio(cambio);
    set({ cambiosPrecio: [...get().cambiosPrecio, cambio] });
  },
}));