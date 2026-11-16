require('dotenv').config({ quiet: true });
const app = require('./app');

// Sin secreto no se pueden firmar ni verificar tokens: mejor no arrancar
if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en el archivo .env');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
