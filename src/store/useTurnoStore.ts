// src/store/useTurnoStore.ts
import { create } from 'zustand';
import { Turno, InventarioItem } from '../domain/entities';
import { TurnoRepository } from '../data/repositories';

const repo = new TurnoRepository();

interface TurnoState {
  turnoActivo: Turno | null;
  inventarioInicial: InventarioItem[];
  inventarioFinal: InventarioItem[];
  historial: Turno[];
  isLoading: boolean;

  cargarTurnoActivo: () => Promise<void>;
  cargarHistorial: () => Promise<void>;
  iniciarTurno: (turno: Turno) => Promise<void>;
  guardarInventarioInicial: (items: InventarioItem[]) => Promise<void>;
  cargarInventarioInicial: (turnoId: string) => Promise<void>;
  cargarInventarioFinal: (turnoId: string) => Promise<void>;
  actualizarCantidadFinal: (item: InventarioItem) => Promise<void>;
  cerrarTurno: () => Promise<void>;
  eliminarTurno: (id: string) => Promise<void>;
}

export const useTurnoStore = create<TurnoState>((set, get) => ({
  turnoActivo: null,
  inventarioInicial: [],
  inventarioFinal: [],
  historial: [],
  isLoading: false,

  cargarTurnoActivo: async () => {
    set({ isLoading: true });
    const turno = await repo.obtenerTurnoActivo();
    set({ turnoActivo: turno, isLoading: false });
  },

  cargarHistorial: async () => {
    const turnos = await repo.obtenerTodos();
    set({ historial: turnos });
  },

  iniciarTurno: async (turno) => {
    await repo.crearTurno(turno);
    set({ turnoActivo: turno, inventarioInicial: [], inventarioFinal: [] });
  },

  guardarInventarioInicial: async (items) => {
    for (const item of items) {
      await repo.guardarInventarioItem(item);
    }
    set({ inventarioInicial: items });
  },

  cargarInventarioInicial: async (turnoId) => {
    const items = await repo.obtenerInventario(turnoId, 'inicial');
    set({ inventarioInicial: items });
  },

  cargarInventarioFinal: async (turnoId) => {
    const items = await repo.obtenerInventario(turnoId, 'final');
    set({ inventarioFinal: items });
  },

  actualizarCantidadFinal: async (item) => {
    await repo.actualizarInventarioFinal(item);
    const updatedFinal = get().inventarioFinal.map((i) =>
      i.productoId === item.productoId ? { ...i, cantidad: item.cantidad } : i
    );
    set({ inventarioFinal: updatedFinal });
  },

  cerrarTurno: async () => {
    const { turnoActivo } = get();
    if (!turnoActivo) return;
    const fechaCierre = new Date().toISOString();
    await repo.cerrarTurno(turnoActivo.id, fechaCierre);
    set({ turnoActivo: null, inventarioInicial: [], inventarioFinal: [] });
  },

  eliminarTurno: async (id) => {
    await repo.eliminarTurno(id);
    set({ historial: get().historial.filter((t) => t.id !== id) });
  },
}));