import { Router } from 'express';
import validate from '../middlewares/validate.js';
import { createTransferenciaSchema, updateTransferenciaSchema } from '../validations/transferencia.js';
import {
  getTransferencias,
  getTransferenciaById,
  createTransferencia,
  updateTransferencia,
  deleteTransferencia,
} from '../controllers/transferenciaController.js';

const router = Router();

router.get('/', getTransferencias);
router.get('/:id', getTransferenciaById);
router.post('/', validate(createTransferenciaSchema), createTransferencia);
router.put('/:id', validate(updateTransferenciaSchema), updateTransferencia);
router.delete('/:id', deleteTransferencia);

export default router;
