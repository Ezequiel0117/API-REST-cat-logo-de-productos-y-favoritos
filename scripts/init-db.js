// Crea la base de datos (si no existe), las tablas y los productos de ejemplo.
// Uso: npm run db:init
require("dotenv").config({ quiet: true });
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const config = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

async function main() {
  const nombreBD = process.env.DB_NAME;

  // 1. Crear la base de datos si no existe (conectándose a la BD "postgres")
  const admin = new Client({ ...config, database: "postgres" });
  await admin.connect();
  const existe = await admin.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [nombreBD],
  );
  if (existe.rowCount === 0) {
    await admin.query(`CREATE DATABASE "${nombreBD}"`);
    console.log(`Base de datos "${nombreBD}" creada`);
  }
  await admin.end();

  // 2. Ejecutar schema.sql y seed.sql dentro de la base de datos
  const cliente = new Client({ ...config, database: nombreBD });
  await cliente.connect();
  const schema = fs.readFileSync(
    path.join(__dirname, "../database/schema.sql"),
    "utf8",
  );
  const seed = fs.readFileSync(
    path.join(__dirname, "../database/seed.sql"),
    "utf8",
  );
  await cliente.query(schema);
  await cliente.query(seed);
  const { rows } = await cliente.query(
    "SELECT COUNT(*)::int AS total FROM productos",
  );
  console.log(`Tablas listas. Productos en la base: ${rows[0].total}`);
  await cliente.end();
}

main().catch((err) => {
  console.error("Error al inicializar la base de datos:", err.message);
  process.exit(1);
});
