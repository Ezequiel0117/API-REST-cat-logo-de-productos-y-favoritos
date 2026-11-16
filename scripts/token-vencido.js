// Genera un JWT firmado correctamente pero YA VENCIDO, para probar en Postman
// que la API responde 401 con un token expirado.
// Uso: npm run token-vencido  -> copiar el resultado en la variable "tokenVencido" del entorno de Postman
require('dotenv').config({ quiet: true });
const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.error('Define JWT_SECRET en el archivo .env');
  process.exit(1);
}

const haceUnaHora = Math.floor(Date.now() / 1000) - 3600;
const token = jwt.sign(
  { id: 1, rol: 'admin', iat: haceUnaHora - 60, exp: haceUnaHora },
  process.env.JWT_SECRET
);

console.log(token);
