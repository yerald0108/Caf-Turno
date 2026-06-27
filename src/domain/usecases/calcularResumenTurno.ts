// src/domain/usecases/calcularResumenTurno.ts
import {
  InventarioItem,
  EntradaProducto,
  SalidaFamiliar,
  Gasto,
  Merma,
  ResumenTurno,
  ResumenProducto,
} from '../entities';

interface CalcularResumenParams {
  turnoId: string;
  fechaInicio: string;
  fechaCierre: string;
  inventarioInicial: InventarioItem[];
  inventarioFinal: InventarioItem[];
  entradas: EntradaProducto[];
  salidasFamiliares: SalidaFamiliar[];
  gastos: Gasto[];
  mermas: Merma[];
}

export function calcularResumenTurno(params: CalcularResumenParams): ResumenTurno {
  const {
    turnoId, fechaInicio, fechaCierre,
    inventarioInicial, inventarioFinal,
    entradas, salidasFamiliares, gastos, mermas,
  } = params;

  const productos: ResumenProducto[] = inventarioInicial.map((itemInicial) => {
    const { productoId, productoNombre, productoPrecio, cantidad: cantInicial } = itemInicial;

    const cantEntradas = entradas
      .filter((e) => e.productoId === productoId)
      .reduce((sum, e) => sum + e.cantidad, 0);

    const cantMermas = mermas
      .filter((m) => m.productoId === productoId)
      .reduce((sum, m) => sum + m.cantidad, 0);

    // Salidas familiares: salen del inventario pero NO generan ingreso en caja
    const cantSalidas = salidasFamiliares
      .flatMap((s) => s.items)
      .filter((i) => i.productoId === productoId)
      .reduce((sum, i) => sum + i.cantidad, 0);

    const itemFinal = inventarioFinal.find((i) => i.productoId === productoId);
    const cantFinal = itemFinal?.cantidad ?? 0;

    // Vendido con ingreso = total consumido - salidas familiares - mermas
    // Es decir: solo lo que realmente se vendió y debe estar en caja
    const totalConsumido = Math.max(0, cantInicial + cantEntradas - cantFinal);
    const cantidadVendida = Math.max(0, totalConsumido - cantSalidas - cantMermas);
    const totalVentas = cantidadVendida * productoPrecio;

    return {
      productoId,
      productoNombre,
      precioUnitario: productoPrecio,
      cantidadInicial: cantInicial,
      cantidadEntradas: cantEntradas,
      cantidadFinal: cantFinal,
      cantidadVendida,
      totalVentas,
    };
  });

  const totalBruto = productos.reduce((sum, p) => sum + p.totalVentas, 0);
  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
  const totalSalidaFamiliar = salidasFamiliares
    .flatMap((s) => s.items)
    .reduce((sum, i) => sum + i.cantidad, 0);

  return {
    turnoId,
    fechaInicio,
    fechaCierre,
    productos,
    totalBruto,
    totalGastos,
    totalSalidaFamiliar,
    saldoEsperadoCaja: totalBruto - totalGastos,
  };
}