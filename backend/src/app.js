import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import pool from './db/index.js';
// Rutas de documento
import documentoRoutes from './routes/documentoRoutes.js';
// Rutas de partes involucradas
import parteRoutes from './routes/parteRoutes.js';
// Rutas de bienes
import bienRoutes from './routes/bienRoutes.js';
import digitalizacionRoutes from './routes/digitalizacionRoutes.js';
import revisionRoutes from './routes/revisionRoutes.js';
import documentoArchivoRoutes from './routes/documentoArchivoRoutes.js';
import historialCambiosRoutes from './routes/historialCambiosRoutes.js';
import transferenciaRoutes from './routes/transferenciaRoutes.js';
import historialPropietariosRoutes from './routes/historialPropietariosRoutes.js';
import tipoDocumentoRoutes from './routes/tipoDocumentoRoutes.js';
import oficinaRegistroRoutes from './routes/oficinaRegistroRoutes.js';
import tipoBienRoutes from './routes/tipoBienRoutes.js';
// Permitir CORS para el frontend en Live Server
import corsOptions from './corsOptions.js';

// Resolve directories in a way that works both in dev and when packaged
const cwd = process.cwd();
// Public folder (where the frontend build will be copied): backend/public by convention
const publicDir = path.join(cwd, 'public');
// Allow overriding uploads dir via env, otherwise try common locations
const envUploads = process.env.UPLOADS_DIR && path.isAbsolute(process.env.UPLOADS_DIR)
  ? process.env.UPLOADS_DIR
  : (process.env.UPLOADS_DIR ? path.join(cwd, process.env.UPLOADS_DIR) : null);
// Try to find an uploads directory: cwd/uploads, one level up, or two levels up (packaged exe in dist)
const uploadsCandidates = [
  envUploads,
  path.join(cwd, 'uploads'),
  path.join(cwd, '..', 'uploads'),
  path.join(cwd, '..', '..', 'uploads'),
].filter(Boolean);
const uploadsDir = uploadsCandidates.find((p) => fs.existsSync(p)) || uploadsCandidates[0];

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
// Serve uploaded PDFs statically (robust path resolution)
app.use('/uploads', express.static(uploadsDir));
app.use(
  rateLimit({
    windowMs: 60_000, // 1 minuto
    max: 100,
  })
);

app.use('/documentos', documentoRoutes);
app.use('/partes', parteRoutes);
app.use('/bienes', bienRoutes);
app.use('/digitalizaciones', digitalizacionRoutes);
app.use('/revisiones', revisionRoutes);
app.use('/archivos', documentoArchivoRoutes);
app.use('/historial-cambios', historialCambiosRoutes);
app.use('/transferencias', transferenciaRoutes);
app.use('/historial-propietarios', historialPropietariosRoutes);
app.use('/tipos-documento', tipoDocumentoRoutes);
app.use('/oficinas-registro', oficinaRegistroRoutes);
app.use('/tipos-bien', tipoBienRoutes);

// Healthcheck simple para que el frontend verifique conexión
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Servir el frontend compilado si existe (Single-Page App)
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  // Fallback para rutas del SPA usando middleware compatible con Express 5
  const apiPrefixes = [
    '/documentos',
    '/partes',
    '/bienes',
    '/digitalizaciones',
    '/revisiones',
    '/archivos',
    '/historial-cambios',
    '/transferencias',
    '/historial-propietarios',
    '/tipos-documento',
    '/oficinas-registro',
    '/tipos-bien',
    '/health',
    '/uploads',
  ];
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    if (apiPrefixes.some((p) => req.path.startsWith(p))) return next();
    const indexFile = path.join(publicDir, 'index.html');
    if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
    return next();
  });
}

export default app;


