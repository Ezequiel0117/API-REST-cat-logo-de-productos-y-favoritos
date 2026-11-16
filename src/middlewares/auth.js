// Middlewares de autenticación (JWT) y autorización (roles)
const jwt = require('jsonwebtoken');

// Verifica que la petición traiga un JWT válido en el encabezado:
//   Authorization: Bearer <token>
// Comprueba la firma y la expiración. Si todo está bien, guarda en req.usuario
// el id y el rol que vienen DENTRO del token (no lo que mande el cliente en el body).
function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization || '';
  const [tipo, token] = encabezado.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.usuario = { id: payload.id, rol: payload.rol };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'El token ha vencido, inicia sesión de nuevo' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Permite el paso solo si el rol del usuario autenticado está en la lista.
// Se usa después de verificarToken, por ejemplo: requiereRol('admin')
function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    }
    next();
  };
}

module.exports = { verificarToken, requiereRol };
