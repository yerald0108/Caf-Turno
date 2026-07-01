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

// Construye el mapa de todos los productos que aparecieron en el turno,
// aunque no estuvieran en el inventario inicial.
function construirMapaProductos(params: CalcularResumenParams): Map<string, {
  productoId: string;
  productoNombre: string;
  productoPrecio: number;
}> {
  const mapa = new Map<string, { productoId: string; productoNombre: string; productoPrecio: number }>();

  for (const item of params.inventarioInicial) {
    if (!mapa.has(item.productoId)) {
      mapa.set(item.productoId, {
        productoId: item.productoId,
        productoNombre: item.productoNombre,
        productoPrecio: item.productoPrecio,
      });
    }
  }

  for (const entrada of params.entradas) {
    if (!mapa.has(entrada.productoId)) {
      mapa.set(entrada.productoId, {
        productoId: entrada.productoId,
        productoNombre: entrada.productoNombre,
        productoPrecio: entrada.productoPrecio,
      });
    }
  }

  for (const merma of params.mermas) {
    if (!mapa.has(merma.productoId)) {
      mapa.set(merma.productoId, {
        productoId: merma.productoId,
        productoNombre: merma.productoNombre,
        productoPrecio: 0, // merma sin precio conocido
      });
    }
  }

  for (const salida of params.salidasFamiliares) {
    for (const item of salida.items) {
      if (!mapa.has(item.productoId)) {
        mapa.set(item.productoId, {
          productoId: item.productoId,
          productoNombre: item.productoNombre,
          productoPrecio: 0, // salida familiar sin precio conocido
        });
      }
    }
  }

  return mapa;
}

export function calcularResumenTurno(params: CalcularResumenParams): ResumenTurno {
  const {
    turnoId, fechaInicio, fechaCierre,
    inventarioInicial, inventarioFinal,
    entradas, salidasFamiliares, gastos, mermas, cambiosPrecio,
  } = params;

  // Unión de todos los productos que participaron en el turno
  const mapaProductos = construirMapaProductos(params);

  const productos: ResumenProducto[] = Array.from(mapaProductos.values()).map((info) => {
    const { productoId, productoNombre, productoPrecio } = info;

    const itemInicial = inventarioInicial.find((i) => i.productoId === productoId);
    const cantInicial = itemInicial?.cantidad ?? 0;

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
      totalVentas += cambio.cantidadVendidaAnterior * cambio.precioAnterior;
      const vendidoAlNuevoPrecio = Math.max(0, cantidadVendida - cambio.cantidadVendidaAnterior);
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