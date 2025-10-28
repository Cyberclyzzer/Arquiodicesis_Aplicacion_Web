import { Router } from 'express';
import {
  getTiposBien,
  getTipoBienById,
  createTipoBien,
  updateTipoBien,
  deleteTipoBien,
} from '../controllers/tipoBienController.js';

const router = Router();

router.get('/', getTiposBien);
router.get('/:id', getTipoBienById);
router.post('/', createTipoBien);
router.put('/:id', updateTipoBien);
router.delete('/:id', deleteTipoBien);

export default router;
