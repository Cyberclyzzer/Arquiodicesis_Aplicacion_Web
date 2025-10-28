import { Router } from 'express';
import {
  getDocumentos,
  getDocumentoById,
  getDocumentoFull,
  createDocumento,
  updateDocumento,
  deleteDocumento,
} from '../controllers/documentoController.js';
import validate from '../middlewares/validate.js';
import { createDocumentoSchema, updateDocumentoSchema } from '../validations/documento.js';

const router = Router();

router.get('/', getDocumentos);
router.get('/:id', getDocumentoById);
router.get('/:id/full', getDocumentoFull);
router.post('/', validate(createDocumentoSchema), createDocumento);
router.put('/:id', validate(updateDocumentoSchema), updateDocumento);
router.delete('/:id', deleteDocumento);

export default router;
