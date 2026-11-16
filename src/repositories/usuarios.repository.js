// Acceso a datos de usuarios. Consultas parametrizadas.
const pool = require('../db/pool');

// Campos que se pueden devolver al cliente (nunca el hash de la contraseña)
const CAMPOS_PUBLICOS = 'id, nombre, correo, rol';

// Incluye el hash porque se usa solo internamente para comparar en el login
async function buscarPorCorreo(correo) {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS}, password_hash FROM usuarios WHERE correo = $1`,
    [correo]
  );
  return rows[0] || null;
}

// El rol siempre es 'usuario': el registro público no puede crear administradores
async function crear({ nombre, correo, passwordHash }) {
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, correo, password_hash, rol)
     VALUES ($1, $2, $3, 'usuario') RETURNING ${CAMPOS_PUBLICOS}`,
    [nombre, correo, passwordHash]
  );
  return rows[0];
}

module.exports = { buscarPorCorreo, crear };
