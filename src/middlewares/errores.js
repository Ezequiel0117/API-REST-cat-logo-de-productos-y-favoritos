// Manejo de errores con formato JSON uniforme: { "error": "mensaje" }
// Nunca se envían al cliente detalles internos (stack, SQL, secretos).

// Ruta no encontrada
function rutaNoEncontrada(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

// Errores no controlados. Express lo reconoce porque recibe 4 parámetros.
function manejadorErrores(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'El cuerpo de la petición es demasiado grande' });
  }
  // El detalle completo solo se muestra en la consola del servidor
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = { rutaNoEncontrada, manejadorErrores };
