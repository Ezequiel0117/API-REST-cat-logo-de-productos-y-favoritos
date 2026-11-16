// Acceso a datos de favoritos. Todas las consultas filtran por usuario_id,
// así cada usuario solo puede ver o borrar sus propios favoritos.
const pool = require('../db/pool');

async function listarPorUsuario(usuarioId) {
  const { rows } = await pool.query(
    `SELECT p.id, p.nombre, p.descripcion, p.categoria, p.precio::float AS precio,
            f.creado_en AS agregado_en
     FROM favoritos f
     JOIN productos p ON p.id = f.producto_id
     WHERE f.usuario_id = $1
     ORDER BY f.creado_en`,
    [usuarioId]
  );
  return rows;
}

// Lanza error 23505 si ya existe (PRIMARY KEY duplicada)
// o 23503 si el producto no existe (FOREIGN KEY)
async function agregar(usuarioId, productoId) {
  await pool.query(
    'INSERT INTO favoritos (usuario_id, producto_id) VALUES ($1, $2)',
    [usuarioId, productoId]
  );
}

// Devuelve true si se quitó. Si el favorito pertenece a otro usuario no se borra nada.
async function quitar(usuarioId, productoId) {
  const { rowCount } = await pool.query(
    'DELETE FROM favoritos WHERE usuario_id = $1 AND producto_id = $2',
    [usuarioId, productoId]
  );
  return rowCount > 0;
}

module.exports = { listarPorUsuario, agregar, quitar };
