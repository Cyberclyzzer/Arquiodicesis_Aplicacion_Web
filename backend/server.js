import dotenv from 'dotenv';
dotenv.config();
import app from './src/app.js';
import initDb from './src/db/db.js';

// Inicializar base de datos y luego arrancar servidor
(async () => {
  await initDb();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})();