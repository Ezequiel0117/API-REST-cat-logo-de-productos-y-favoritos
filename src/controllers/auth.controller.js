// Controlador de autenticación: registro e inicio de sesión.
// Criterio de errores:
//   400 -> falta un campo o está vacío
//   422 -> el correo no tiene formato válido o la contraseña es muy corta
//   409 -> el correo ya está registrado
//   401 -> credenciales incorrectas
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repo = require('../repositories/usuarios.repository');

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

function esTextoVacio(valor) {
  return typeof valor !== 'string' || valor.trim() === '';
}

// POST /api/auth/registro
async function registro(req, res) {
  // Solo se leen estos campos. Si el cliente envía "rol", se ignora.
  const { nombre, correo, password } = req.body || {};

  if (esTextoVacio(nombre)) return res.status(400).json({ error: 'El campo "nombre" es obligatorio' });
  if (esTextoVacio(correo)) return res.status(400).json({ error: 'El campo "correo" es obligatorio' });
  if (esTextoVacio(password)) return res.status(400).json({ error: 'El campo "password" es obligatorio' });

  const correoNormalizado = correo.trim().toLowerCase();
  if (!REGEX_CORREO.test(correoNormalizado)) {
    return res.status(422).json({ error: 'El correo no tiene un formato válido' });
  }
  if (password.length < MIN_PASSWORD) {
    return res.status(422).json({ error: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres` });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const usuario = await repo.crear({ nombre: nombre.trim(), correo: correoNormalizado, passwordHash });
    res.status(201).json({ data: usuario });
  } catch (err) {
    // 23505 = violación de UNIQUE en PostgreSQL (correo repetido)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    throw err;
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { correo, password } = req.body || {};
  if (esTextoVacio(correo) || esTextoVacio(password)) {
    return res.status(400).json({ error: 'Los campos "correo" y "password" son obligatorios' });
  }

  const usuario = await repo.buscarPorCorreo(correo.trim().toLowerCase());
  const coincide = usuario && (await bcrypt.compare(password, usuario.password_hash));

  // Mismo mensaje si el correo no existe o la contraseña es incorrecta,
  // para no revelar qué correos están registrados
  if (!coincide) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

  res.status(200).json({
    data: {
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    },
  });
}

module.exports = { registro, login };
