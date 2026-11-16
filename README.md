# API Catálogo de Productos y Favoritos

API REST con Node.js, Express y PostgreSQL para gestionar un catálogo de productos y los favoritos personales de cada usuario, con autenticación JWT y autorización por roles.

## Integrante

| Integrante | Aportes |
|---|---|
| Ezequiel | Desarrollo completo: estructura del proyecto, base de datos, CRUD de productos, autenticación JWT, roles, favoritos, manejo de errores, pruebas en Postman y documentación |

## Propósito

- Cualquier persona puede consultar el catálogo de productos y filtrarlo por categoría.
- Los usuarios registrados pueden guardar productos en su lista personal de favoritos.
- Solo el administrador puede crear, actualizar y eliminar productos.

## Elección de base de datos

Usamos **PostgreSQL** porque los datos son relacionales (un usuario tiene muchos favoritos y un producto puede ser favorito de muchos usuarios), y porque permite garantizar reglas directamente en la base:

- `UNIQUE` en el correo del usuario.
- `CHECK (precio > 0)` en productos.
- `CHECK (rol IN ('usuario', 'admin'))` en usuarios.
- `PRIMARY KEY (usuario_id, producto_id)` en favoritos, para no tener duplicados.
- `ON DELETE CASCADE`: **al eliminar un producto se eliminan automáticamente sus favoritos**, así no quedan referencias a productos inexistentes.

Todas las consultas son parametrizadas (`$1, $2...`) para evitar inyección SQL. El script del esquema está en [`database/schema.sql`](database/schema.sql).

## Modelo de datos

| Tabla | Campos |
|---|---|
| `usuarios` | `id`, `nombre`, `correo` (único), `password_hash`, `rol` (`usuario` o `admin`), `creado_en` |
| `productos` | `id`, `nombre`, `descripcion`, `categoria`, `precio` (> 0), `creado_en` |
| `favoritos` | `usuario_id` → usuarios, `producto_id` → productos, `creado_en`. Clave primaria compuesta (sin duplicados) |

## Requisitos

- Node.js 18 o superior
- PostgreSQL 14 o superior en ejecución
- Postman (para las pruebas)

## Instalación

```bash
git clone https://github.com/Ezequiel0117/API-REST-cat-logo-de-productos-y-favoritos.git
cd API-REST-cat-logo-de-productos-y-favoritos
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

Para generar un `JWT_SECRET` aleatorio:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

El archivo `.env` no se sube al repositorio (está en `.gitignore`).

## Inicialización de datos y del administrador

```bash
npm run db:init
```

Crea la base de datos (si no existe), las tablas de `database/schema.sql` y 7 productos de ejemplo de `database/seed.sql`. Se puede ejecutar varias veces sin duplicar datos.

```bash
npm run crear-admin
```

Crea el usuario administrador con los datos `ADMIN_*` del `.env`. **Es la única forma de obtener el rol `admin`**: el registro público siempre crea usuarios con rol `usuario`, aunque se envíe `"rol": "admin"` en el cuerpo.

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
├── postman/
│   ├── catalogo.postman_collection.json
│   └── catalogo.postman_environment.json
├── scripts/
│   ├── init-db.js              # Crea la BD, las tablas y los datos
│   ├── crear-admin.js          # Crea el administrador
│   └── token-vencido.js        # Genera un token vencido para las pruebas
├── src/
│   ├── db/pool.js              # Conexión a PostgreSQL
│   ├── middlewares/
│   │   ├── auth.js             # verificarToken (JWT) y requiereRol
│   │   └── errores.js          # 404 y manejo de errores
│   ├── repositories/           # Consultas SQL (acceso a datos)
│   ├── controllers/            # Validación y respuestas
│   ├── routes/                 # Definición de rutas
│   ├── app.js                  # Configuración de Express
│   └── server.js               # Arranque del servidor
├── .env.example
└── package.json
```

Flujo de una petición: **ruta → middlewares (token y rol) → controlador (validación) → repositorio (SQL) → PostgreSQL → respuesta JSON**.

## Autenticación y permisos

- Al iniciar sesión se emite un JWT firmado con `JWT_SECRET` que vence según `JWT_EXPIRES_IN`. Contiene el `id` y el `rol` del usuario.
- Las rutas protegidas requieren el encabezado `Authorization: Bearer <token>`. El middleware `verificarToken` comprueba la firma y la expiración. Sin token, con token alterado o con token vencido responde **401**.
- `requiereRol('admin')` responde **403** si el usuario autenticado no es administrador.
- En favoritos, el usuario se obtiene **del token verificado** (`req.usuario.id`). Si el cliente envía un `usuarioId` en el cuerpo, se ignora. Todas las consultas de favoritos filtran por ese id, así cada usuario solo ve y borra los suyos.
- Las contraseñas se guardan con `bcrypt` y nunca se devuelven ni la contraseña ni su hash.

## Formato de respuestas

- Éxito: `{ "data": ... }`
- Error: `{ "error": "mensaje" }`
- Eliminación exitosa: `204 No Content` (sin cuerpo)

Los errores inesperados responden `500` con un mensaje genérico. El detalle solo se muestra en la consola del servidor, nunca al cliente.

### Criterio de códigos de error

| Código | Cuándo |
|---|---|
| 400 | Falta un campo obligatorio, está vacío, el JSON es inválido o un id no es un entero positivo |
| 422 | Los campos están presentes pero su valor no es válido: precio no mayor que cero, correo con formato inválido o contraseña de menos de 6 caracteres |
| 401 | Sin token, token inválido, token vencido o credenciales incorrectas |
| 403 | El usuario autenticado no tiene el rol necesario |
| 404 | El producto, el favorito o la ruta no existen |
| 409 | Correo ya registrado o producto ya agregado a favoritos |

## Rutas

| Método | Ruta | Acceso | Respuesta exitosa | Errores posibles |
|---|---|---|---|---|
| POST | `/api/auth/registro` | Público | 201, usuario creado | 400, 409, 422 |
| POST | `/api/auth/login` | Público | 200, token y usuario | 400, 401 |
| GET | `/api/productos` | Público | 200, lista de productos | |
| GET | `/api/productos?categoria=ropa` | Público | 200, productos de esa categoría | |
| GET | `/api/productos/:id` | Público | 200, un producto | 400, 404 |
| POST | `/api/productos` | Administrador | 201, producto creado | 400, 401, 403, 422 |
| PUT | `/api/productos/:id` | Administrador | 200, producto actualizado | 400, 401, 403, 404, 422 |
| DELETE | `/api/productos/:id` | Administrador | 204 | 400, 401, 403, 404 |
| GET | `/api/favoritos` | Autenticado | 200, favoritos del usuario | 401 |
| POST | `/api/favoritos` | Autenticado | 201, producto agregado | 400, 401, 404, 409 |
| DELETE | `/api/favoritos/:productoId` | Autenticado | 204 | 400, 401, 404 |

### POST `/api/auth/registro`

```json
{
  "nombre": "Usuario Prueba",
  "correo": "usuario@ejemplo.com",
  "password": "ClavePrueba123"
}
```

Respuesta `201`:

```json
{
  "data": { "id": 2, "nombre": "Usuario Prueba", "correo": "usuario@ejemplo.com", "rol": "usuario" }
}
```

### POST `/api/auth/login`

```json
{
  "correo": "usuario@ejemplo.com",
  "password": "ClavePrueba123"
}
```

Respuesta `200`:

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "usuario": { "id": 2, "nombre": "Usuario Prueba", "correo": "usuario@ejemplo.com", "rol": "usuario" }
  }
}
```

### POST y PUT `/api/productos`

Todos los campos son obligatorios:

```json
{
  "nombre": "Mochila Urbana",
  "descripcion": "Mochila de 20 litros resistente al agua",
  "categoria": "accesorios",
  "precio": 34.99
}
```

Respuesta (`201` al crear, `200` al actualizar):

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

### POST `/api/favoritos`

```json
{ "productoId": 3 }
```

Respuesta `201`: el producto agregado, con el mismo formato que en productos.

### GET `/api/favoritos`

Respuesta `200`:

```json
{
  "data": [
    { "id": 3, "nombre": "Camiseta Básica", "descripcion": "...", "categoria": "ropa", "precio": 12.5, "agregado_en": "2026-11-16T10:00:00.000Z" }
  ]
}
```

## Pruebas con Postman

1. Inicia el servidor con `npm start`.
2. En Postman, haz clic en **Import** y selecciona los dos archivos de la carpeta `postman/`.
3. Arriba a la derecha, selecciona el entorno **Catálogo - Local**.
4. En el entorno, completa:
   - `adminPassword`: el mismo valor de `ADMIN_PASSWORD` del `.env`.
   - `tokenVencido`: ejecuta el siguiente comando y pega el resultado.

     ```bash
     npm run token-vencido
     ```

5. Abre la colección, haz clic en **Run** y ejecuta las carpetas **1 a 6** en orden.
6. Detén el servidor (`Ctrl + C`), vuelve a iniciarlo con `npm start` y ejecuta la carpeta **7. Persistencia** para comprobar que los datos siguen guardados.

Cada ejecución registra usuarios A y B nuevos (con correos distintos), así que la colección se puede ejecutar varias veces.

| Carpeta | Qué demuestra |
|---|---|
| 1. Autenticación | Registro y login correctos, el rol enviado se ignora, correo duplicado (409), campos vacíos (400), correo inválido (422) y credenciales incorrectas (401) |
| 2. Productos | Listar, filtrar por categoría y CRUD como administrador. Precio inválido (422), campos vacíos (400), producto inexistente (404) |
| 3. Seguridad | Sin token, token vencido y token alterado (401). Usuario normal modificando el catálogo (403) |
| 4. Favoritos | Agregar, listar, duplicado (409), producto inexistente (404) |
| 5. Aislamiento | B no ve ni puede quitar los favoritos de A, y el `usuarioId` enviado en el cuerpo se ignora. El favorito de A permanece |
| 6. Eliminación | Quitar un favorito (204). Al eliminar un producto, sus favoritos se borran en cascada |
| 7. Persistencia | Tras reiniciar el servidor, los productos, usuarios y favoritos siguen en la base |

### Ejecutar desde la terminal (opcional)

Con [Newman](https://www.npmjs.com/package/newman), el ejecutor de Postman por línea de comandos:

```bash
npx newman run postman/catalogo.postman_collection.json -e postman/catalogo.postman_environment.json --env-var "adminPassword=TU_ADMIN_PASSWORD" --env-var "tokenVencido=TOKEN_GENERADO"
```

## Recursos y herramientas de apoyo

- Documentación de [Express](https://expressjs.com/), [node-postgres](https://node-postgres.com/), [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) y [bcryptjs](https://github.com/dcodeIO/bcrypt.js).
- [Documentación de Postman](https://learning.postman.com/) para las pruebas y aserciones.
- Claude (Anthropic) como asistente de programación para revisar la estructura, el código y las pruebas.
