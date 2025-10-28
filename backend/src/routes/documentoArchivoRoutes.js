import { Router } from 'express';
import multer from 'multer';
// ...existing imports...
import {
  getDocumentoArchivos,
  getDocumentoArchivoById,
  createDocumentoArchivo,
  updateDocumentoArchivo,
  deleteDocumentoArchivo,
} from '../controllers/documentoArchivoController.js';

const router = Router();

// Multer configuration for PDF uploads (local storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') return cb(new Error('Solo se permiten PDFs'));
    cb(null, true);
  }
});

router.get('/', getDocumentoArchivos);
router.get('/:id', getDocumentoArchivoById);
// Upload single PDF under field 'file'
router.post('/', upload.single('file'), createDocumentoArchivo);
router.put('/:id', upload.single('file'), updateDocumentoArchivo);
router.delete('/:id', deleteDocumentoArchivo);

export default router;
