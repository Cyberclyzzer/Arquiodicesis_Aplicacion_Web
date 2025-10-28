import { Router } from 'express';
import {
  getTiposDocumento,
  getTipoDocumentoById,
  createTipoDocumento,
  updateTipoDocumento,
  deleteTipoDocumento,
} from '../controllers/tipoDocumentoController.js';

const router = Router();

router.get('/', getTiposDocumento);
router.get('/:id', getTipoDocumentoById);
router.post('/', createTipoDocumento);
router.put('/:id', updateTipoDocumento);
router.delete('/:id', deleteTipoDocumento);

export default router;
