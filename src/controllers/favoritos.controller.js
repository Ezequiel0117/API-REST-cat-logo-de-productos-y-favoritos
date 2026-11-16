// Controlador de favoritos. El usuario SIEMPRE se toma de req.usuario,
// que viene del token verificado. Nunca se usa un usuarioId enviado por el cliente.
const repo = require('../repositories/favoritos.repository');
const productosRepo = require('../repositories/productos.repository');
const { parsearId } = require('./productos.controller');

// GET /api/favoritos
async function listar(req, res) {
  const favoritos = await repo.listarPorUsuario(req.usuario.id);
  res.status(200).json({ data: favoritos });
}

// POST /api/favoritos   body: { "productoId": 3 }
async function agregar(req, res) {
  const { productoId } = req.body || {};
  if (productoId === undefined || productoId === null || productoId === '') {
    return res.status(400).json({ error: 'El campo "productoId" es obligatorio' });
  }
  const id = parsearId(String(productoId));
  if (!id) return res.status(400).json({ error: 'El productoId debe ser un número entero positivo' });

  const producto = await productosRepo.buscarPorId(id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

  try {
    await repo.agregar(req.usuario.id, id);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El producto ya está en tus favoritos' });
    }
    if (err.code === '23503') {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    throw err;
  }

  res.status(201).json({ data: producto });
}

// DELETE /api/favoritos/:productoId
async function quitar(req, res) {
  const id = parsearId(req.params.productoId);
  if (!id) return res.status(400).json({ error: 'El productoId debe ser un número entero positivo' });

  const quitado = await repo.quitar(req.usuario.id, id);
  if (!quitado) {
    return res.status(404).json({ error: 'El producto no está en tus favoritos' });
  }

  res.status(204).end();
}

module.exports = { listar, agregar, quitar };
