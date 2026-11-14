-- Esquema de la base de datos: usuarios, productos y favoritos
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'usuario' CHECK (rol IN ('usuario', 'admin')),
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  precio NUMERIC(10, 2) NOT NULL CHECK (precio > 0),
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Un usuario no puede tener el mismo producto dos veces (PRIMARY KEY compuesta).
-- Si se elimina un producto o un usuario, sus favoritos se borran (ON DELETE CASCADE)
-- para que no queden registros huérfanos.
CREATE TABLE IF NOT EXISTS favoritos (
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuario_id, producto_id)
);