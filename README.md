# API Catálogo de Productos y Favoritos

API REST con Node.js, Express y PostgreSQL para gestionar un catálogo de productos y los favoritos personales de cada usuario, con autenticación JWT y autorización por roles.

## Integrantes

| Integrante | Aportes |
|---|---|
| Ezequiel | Estructura del proyecto, conexión a la BD, esquema SQL, datos de ejemplo, script del administrador, CRUD de productos y validaciones |
| Daya | Registro e inicio de sesión, JWT, middlewares de autenticación y roles, favoritos, manejo de errores |

## Elección de base de datos

Usamos **PostgreSQL** porque los datos son relacionales (un usuario tiene muchos favoritos y un producto puede ser favorito de muchos usuarios), y porque permite garantizar reglas directamente en la base:

- `UNIQUE` en el correo del usuario.
- `CHECK (precio > 0)` en productos.
- `PRIMARY KEY (usuario_id, producto_id)` en favoritos, para no tener duplicados.
- `ON DELETE CASCADE`: **al eliminar un producto se eliminan automáticamente sus favoritos**, así no quedan referencias a productos inexistentes.

Todas las consultas son parametrizadas (`$1, $2...`) para evitar inyección SQL.

## Requisitos

- Node.js 18 o superior
- PostgreSQL 14 o superior en ejecución
- Postman (para las pruebas)

## Instalación

```bash
git clone <URL_DEL_REPOSITORIO>
cd <carpeta-del-proyecto>
npm install
```

Copia `.env.example` como `.env` y completa los valores:

```bash
cp .env.example .env
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (por defecto 3000) |
| `DB_HOST`, `DB_PORT` | Servidor y puerto de PostgreSQL |
| `DB_USER`, `DB_PASSWORD` | Usuario y contraseña de PostgreSQL |
| `DB_NAME` | Nombre de la base de datos (se crea sola si no existe) |
| `JWT_SECRET` | Secreto para firmar los tokens (una cadena larga y aleatoria) |
| `JWT_EXPIRES_IN` | Tiempo de vencimiento del token, por ejemplo `1h` |
| `ADMIN_NOMBRE`, `ADMIN_CORREO`, `ADMIN_PASSWORD` | Datos del administrador inicial |

## Inicialización de datos y del administrador

```bash
npm run db:init
```

Crea la base de datos (si no existe), las tablas de `database/schema.sql` y 7 productos de ejemplo de `database/seed.sql`. Se puede ejecutar varias veces sin duplicar datos.

```bash
npm run crear-admin
```

Crea el usuario administrador con los datos `ADMIN_*` del `.env`. **Es la única forma de obtener el rol `admin`**: el registro público siempre crea usuarios con rol `usuario`.

## Ejecución

```bash
npm start
```

Para desarrollo (se reinicia al guardar cambios):

```bash
npm run dev
```

El servidor queda en `http://localhost:3000`.

## Estructura del proyecto

```
├── database/
│   ├── schema.sql              # Tablas: usuarios, productos, favoritos
│   └── seed.sql                # Productos de ejemplo
├── scripts/
│   ├── init-db.js              # Crea la BD, las tablas y los datos
│   └── crear-admin.js          # Crea el administrador
├── src/
│   ├── db/pool.js              # Conexión a PostgreSQL
│   ├── repositories/           # Consultas SQL (acceso a datos)
│   ├── controllers/            # Validación y respuestas
│   ├── routes/                 # Definición de rutas
│   ├── app.js                  # Configuración de Express
│   └── server.js               # Arranque del servidor
├── .env.example
└── package.json
```

## Formato de respuestas

- Éxito: `{ "data": ... }`
- Error: `{ "error": "mensaje" }`
- Eliminación exitosa: `204 No Content` (sin cuerpo)

### Criterio de códigos de error

| Código | Cuándo |
|---|---|
| 400 | Falta un campo obligatorio, está vacío, el JSON es inválido o el id no es un entero positivo |
| 422 | Los campos están presentes pero el precio no es un número mayor que cero |
| 404 | El producto o la ruta no existen |

## Rutas de productos

| Método | Ruta | Acceso | Respuesta exitosa |
|---|---|---|---|
| GET | `/api/productos` | Público | 200, lista de productos |
| GET | `/api/productos?categoria=ropa` | Público | 200, productos de esa categoría |
| GET | `/api/productos/:id` | Público | 200, un producto |
| POST | `/api/productos` | Administrador | 201, producto creado |
| PUT | `/api/productos/:id` | Administrador | 200, producto actualizado |
| DELETE | `/api/productos/:id` | Administrador | 204 |

Cuerpo para `POST` y `PUT` (todos los campos son obligatorios):

```json
{
  "nombre": "Mochila Urbana",
  "descripcion": "Mochila de 20 litros resistente al agua",
  "categoria": "accesorios",
  "precio": 34.99
}
```

Respuesta:

```json
{
  "data": {
    "id": 8,
    "nombre": "Mochila Urbana",
    "descripcion": "Mochila de 20 litros resistente al agua",
    "categoria": "accesorios",
    "precio": 34.99
  }
}
```

## Pruebas con Postman

<!-- TODO: pasos para importar la colección y el entorno -->
