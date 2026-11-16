const { Router } = require('express');
const ctrl = require('../controllers/productos.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

// Rutas públicas: cualquiera puede consultar el catálogo
router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);

// Rutas de administrador: primero se verifica el token (401) y luego el rol (403)
router.post('/', verificarToken, requiereRol('admin'), ctrl.crear);
router.put('/:id', verificarToken, requiereRol('admin'), ctrl.actualizar);
router.delete('/:id', verificarToken, requiereRol('admin'), ctrl.eliminar);

module.exports = router;
