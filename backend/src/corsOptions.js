import dotenv from 'dotenv';
dotenv.config();

// Build allowed origins from env + sensible defaults (Live Server, common localhost ports)
const parseOrigins = (val) =>
  (val || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const defaultOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://127.0.0.1:3000',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
];

const envOrigins = parseOrigins(process.env.CORS_ORIGINS);
// Include backend origin when serving frontend from the same server
const backendPort = process.env.PORT || '3000';
const sameOrigin = [`http://localhost:${backendPort}`, `http://127.0.0.1:${backendPort}`];
const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultOrigins, ...sameOrigin]));

const corsOptions = {
  // Allow requests with no origin like curl/Postman and allow if in whitelist
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  optionsSuccessStatus: 204,
  // Expose headers useful for downloads, etc.
  exposedHeaders: ['Content-Disposition'],
};

export default corsOptions;
