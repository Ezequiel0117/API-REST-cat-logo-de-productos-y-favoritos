// Controlador de productos: valida la petición, llama al repositorio y arma la respuesta JSON.
// Criterio de errores:
//   400 -> falta un campo, está vacío o el id no es un número entero válido
//   422 -> el formato es correcto pero el precio no es un número mayor que cero
//   404 -> el producto no existe
const repo = require('../repositories/productos.repository');

// Convierte el id de la URL en número; devuelve null si no es un entero positivo válido
function parsearId(valor) {
  if (!/^\d+$/.test(valor)) return null;
  const id = Number(valor);
  return id > 0 && id <= 2147483647 ? id : null;
}

// Valida y limpia el cuerpo. Solo se aceptan estos 4 campos; cualquier otro se ignora.
function validarProducto(body) {
  const { nombre, descripcion, categoria, precio } = body || {};
  const textos = { nombre, descripcion, categoria };

  for (const [campo, valor] of Object.entries(textos)) {
    if (typeof valor !== 'string' || valor.trim() === '') {
      return { status: 400, error: `El campo "${campo}" es obligatorio` };
    }
  }
  if (precio === undefined || precio === null || precio === '') {
    return { status: 400, error: 'El campo "precio" es obligatorio' };
  }
  const numero = Number(precio);
  if (typeof precio === 'boolean' || !Number.isFinite(numero) || numero <= 0) {
    return { status: 422, error: 'El precio debe ser un número mayor que cero' };
  }

  return {
    datos: {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      categoria: categoria.trim().toLowerCase(),
      precio: Math.round(numero * 100) / 100,
    },
  };
}

// GET /api/productos?categoria=ropa
async function listar(req, res) {
  const categoria = typeof req.query.categoria === 'string' ? req.query.categoria.trim() : '';
  const productos = await repo.listar(categoria);
  res.status(200).json({ data: productos });
}

// GET /api/productos/:id
async function obtener(req, res) {
  const id = parsearId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un número entero positivo' });

  const producto = await repo.buscarPorId(id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

  res.status(200).json({ data: producto });
}

// POST /api/productos  (solo admin)
async function crear(req, res) {
  const { status, error, datos } = validarProducto(req.body);
  if (error) return res.status(status).json({ error });

  const producto = await repo.crear(datos);
  res.status(201).json({ data: producto });
}

// PUT /api/productos/:id  (solo admin)
async function actualizar(req, res) {
  const id = parsearId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un número entero positivo' });

  const { status, error, datos } = validarProducto(req.body);
  if (error) return res.status(status).json({ error });

  const producto = await repo.actualizar(id, datos);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

  res.status(200).json({ data: producto });
}

// DELETE /api/productos/:id  (solo admin)
async function eliminar(req, res) {
  const id = parsearId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un número entero positivo' });

  const eliminado = await repo.eliminar(id);
  if (!eliminado) return res.status(404).json({ error: 'Producto no encontrado' });

  res.status(204).end();
}

module.exports = { listar, obtener, crear, actualizar, eliminar, parsearId };
