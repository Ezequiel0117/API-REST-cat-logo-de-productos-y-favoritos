const { Router } = require('express');
const ctrl = require('../controllers/productos.controller');

const router = Router();

// Rutas públicas: cualquiera puede consultar el catálogo
router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);

// Rutas de administrador.
router.post('/', ctrl.crear);
router.put('/:id', ctrl.actualizar);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
