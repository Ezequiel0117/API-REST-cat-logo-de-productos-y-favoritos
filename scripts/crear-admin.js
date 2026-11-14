// Crea el usuario administrador con los datos del .env (ADMIN_NOMBRE, ADMIN_CORREO, ADMIN_PASSWORD).
// Es la única forma de obtener el rol "admin": el registro público siempre crea rol "usuario".
// Uso: npm run crear-admin
const bcrypt = require("bcryptjs");
const pool = require("../src/db/pool");

async function main() {
  const { ADMIN_NOMBRE, ADMIN_CORREO, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NOMBRE || !ADMIN_CORREO || !ADMIN_PASSWORD) {
    throw new Error(
      "Define ADMIN_NOMBRE, ADMIN_CORREO y ADMIN_PASSWORD en el archivo .env",
    );
  }

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // Si el correo ya existe, lo convierte en admin y actualiza su contraseña
  await pool.query(
    `INSERT INTO usuarios (nombre, correo, password_hash, rol)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (correo) DO UPDATE SET password_hash = EXCLUDED.password_hash, rol = 'admin'`,
    [ADMIN_NOMBRE, ADMIN_CORREO.toLowerCase(), hash],
  );
  console.log(`Administrador listo: ${ADMIN_CORREO}`);
}

main()
  .catch((err) => {
    console.error("Error al crear el administrador:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
