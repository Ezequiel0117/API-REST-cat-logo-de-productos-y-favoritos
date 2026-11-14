// Acceso a datos de productos. Todas las consultas son parametrizadas ($1, $2...)
// para evitar inyección SQL.
const pool = require('../db/pool');

const CAMPOS = 'id, nombre, descripcion, categoria, precio::float AS precio';

async function listar(categoria) {
  if (categoria) {
    const { rows } = await pool.query(
      `SELECT ${CAMPOS} FROM productos WHERE LOWER(categoria) = LOWER($1) ORDER BY id`,
      [categoria]
    );
    return rows;
  }
  const { rows } = await pool.query(`SELECT ${CAMPOS} FROM productos ORDER BY id`);
  return rows;
}

async function buscarPorId(id) {
  const { rows } = await pool.query(`SELECT ${CAMPOS} FROM productos WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function crear({ nombre, descripcion, categoria, precio }) {
  const { rows } = await pool.query(
    `INSERT INTO productos (nombre, descripcion, categoria, precio)
     VALUES ($1, $2, $3, $4) RETURNING ${CAMPOS}`,
    [nombre, descripcion, categoria, precio]
  );
  return rows[0];
}

async function actualizar(id, { nombre, descripcion, categoria, precio }) {
  const { rows } = await pool.query(
    `UPDATE productos SET nombre = $1, descripcion = $2, categoria = $3, precio = $4
     WHERE id = $5 RETURNING ${CAMPOS}`,
    [nombre, descripcion, categoria, precio, id]
  );
  return rows[0] || null;
}

// Devuelve true si se eliminó. Los favoritos del producto se borran por ON DELETE CASCADE.
async function eliminar(id) {
  const { rowCount } = await pool.query('DELETE FROM productos WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { listar, buscarPorId, crear, actualizar, eliminar };
