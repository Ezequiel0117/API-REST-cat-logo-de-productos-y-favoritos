const { Router } = require('express');
const ctrl = require('../controllers/favoritos.controller');
const { verificarToken } = require('../middlewares/auth');

const router = Router();

// Todas las rutas de favoritos requieren iniciar sesión
router.use(verificarToken);

router.get('/', ctrl.listar);
router.post('/', ctrl.agregar);
router.delete('/:productoId', ctrl.quitar);

module.exports = router;
