// src/data/database/migrations.ts
import { getDatabase } from './database';

export function runMigrations(): void {
  const db = getDatabase();

  db.execSync(`
    CREATE TABLE IF NOT EXISTS productos (
      id          TEXT PRIMARY KEY NOT NULL,
      nombre      TEXT NOT NULL,
      precio      REAL NOT NULL,
      categoria   TEXT
    );

    CREATE TABLE IF NOT EXISTS turnos (
      id           TEXT PRIMARY KEY NOT NULL,
      fechaInicio  TEXT NOT NULL,
      fechaCierre  TEXT,
      estado       TEXT NOT NULL DEFAULT 'activo',
      notas        TEXT
    );

    CREATE TABLE IF NOT EXISTS inventario_items (
      id               TEXT PRIMARY KEY NOT NULL,
      turnoId          TEXT NOT NULL,
      productoId       TEXT NOT NULL,
      productoNombre   TEXT NOT NULL,
      productoPrecio   REAL NOT NULL,
      cantidad         REAL NOT NULL,
      tipo             TEXT NOT NULL,
      FOREIGN KEY (turnoId) REFERENCES turnos(id)
    );

    CREATE TABLE IF NOT EXISTS entradas (
      id              TEXT PRIMARY KEY NOT NULL,
      turnoId         TEXT NOT NULL,
      productoId      TEXT NOT NULL,
      productoNombre  TEXT NOT NULL,
      productoPrecio  REAL NOT NULL,
      cantidad        REAL NOT NULL,
      fecha           TEXT NOT NULL,
      notas           TEXT,
      FOREIGN KEY (turnoId) REFERENCES turnos(id)
    );

    CREATE TABLE IF NOT EXISTS salidas_familiares (
      id       TEXT PRIMARY KEY NOT NULL,
      turnoId  TEXT NOT NULL,
      persona  TEXT NOT NULL,
      fecha    TEXT NOT NULL,
      notas    TEXT,
      FOREIGN KEY (turnoId) REFERENCES turnos(id)
    );

    CREATE TABLE IF NOT EXISTS salidas_familiares_items (
      id              TEXT PRIMARY KEY NOT NULL,
      salidaId        TEXT NOT NULL,
      productoId      TEXT NOT NULL,
      productoNombre  TEXT NOT NULL,
      cantidad        REAL NOT NULL,
      FOREIGN KEY (salidaId) REFERENCES salidas_familiares(id)
    );

    CREATE TABLE IF NOT EXISTS gastos (
      id           TEXT PRIMARY KEY NOT NULL,
      turnoId      TEXT NOT NULL,
      descripcion  TEXT NOT NULL,
      monto        REAL NOT NULL,
      fecha        TEXT NOT NULL,
      notas        TEXT,
      FOREIGN KEY (turnoId) REFERENCES turnos(id)
    );

    CREATE TABLE IF NOT EXISTS mermas (
      id              TEXT PRIMARY KEY NOT NULL,
      turnoId         TEXT NOT NULL,
      productoId      TEXT NOT NULL,
      productoNombre  TEXT NOT NULL,
      cantidad        REAL NOT NULL,
      motivo          TEXT NOT NULL,
      descripcion     TEXT,
      fecha           TEXT NOT NULL,
      FOREIGN KEY (turnoId) REFERENCES turnos(id)
    );

    CREATE TABLE IF NOT EXISTS cambios_precio (
      id                      TEXT PRIMARY KEY NOT NULL,
      turnoId                 TEXT NOT NULL,
      productoId              TEXT NOT NULL,
      productoNombre          TEXT NOT NULL,
      precioAnterior          REAL NOT NULL,
      precioNuevo             REAL NOT NULL,
      cantidadVendidaAnterior REAL NOT NULL DEFAULT 0,
      cantidadRestante        REAL NOT NULL DEFAULT 0,
      fecha                   TEXT NOT NULL,
      FOREIGN KEY (turnoId) REFERENCES turnos(id)
    );
  `);
}