// src/domain/usecases/calcularResumenTurno.ts
import {
  InventarioItem,
  EntradaProducto,
  SalidaFamiliar,
  Gasto,
  Merma,
  CambioPrecio,
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
  cambiosPrecio: CambioPrecio[];
}

export function calcularResumenTurno(params: CalcularResumenParams): ResumenTurno {
  const {
    turnoId, fechaInicio, fechaCierre,
    inventarioInicial, inventarioFinal,
    entradas, salidasFamiliares, gastos, mermas, cambiosPrecio,
  } = params;

  const productos: ResumenProducto[] = inventarioInicial.map((itemInicial) => {
    const { productoId, productoNombre, productoPrecio, cantidad: cantInicial } = itemInicial;

    const cantEntradas = entradas
      .filter((e) => e.productoId === productoId)
      .reduce((sum, e) => sum + e.cantidad, 0);

    const cantMermas = mermas
      .filter((m) => m.productoId === productoId)
      .reduce((sum, m) => sum + m.cantidad, 0);

    const cantSalidas = salidasFamiliares
      .flatMap((s) => s.items)
      .filter((i) => i.productoId === productoId)
      .reduce((sum, i) => sum + i.cantidad, 0);

    const itemFinal = inventarioFinal.find((i) => i.productoId === productoId);
    const cantFinal = itemFinal?.cantidad ?? 0;

    const totalConsumido = Math.max(0, cantInicial + cantEntradas - cantFinal);
    const cantidadVendida = Math.max(0, totalConsumido - Math.min(cantSalidas + cantMermas, totalConsumido));

    // Verificar si hubo cambio de precio para este producto
    const cambio = cambiosPrecio.find((c) => c.productoId === productoId);

    let totalVentas = 0;
    if (cambio) {
      // Ventas al precio anterior (ingresadas manualmente)
      totalVentas += cambio.cantidadVendidaAnterior * cambio.precioAnterior;
      // Ventas restantes al precio nuevo
      const vendidoAlNuevoPrecio = Math.max(
        0,
        cantidadVendida - cambio.cantidadVendidaAnterior
      );
      totalVentas += vendidoAlNuevoPrecio * cambio.precioNuevo;
    } else {
      totalVentas = cantidadVendida * productoPrecio;
    }

    return {
      productoId,
      productoNombre,
      precioUnitario: cambio ? cambio.precioNuevo : productoPrecio,
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