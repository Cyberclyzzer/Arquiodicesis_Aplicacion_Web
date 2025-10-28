import { Router } from 'express';
import {
  getOficinasRegistro,
  getOficinaRegistroById,
  createOficinaRegistro,
  updateOficinaRegistro,
  deleteOficinaRegistro,
} from '../controllers/oficinaRegistroController.js';

const router = Router();

router.get('/', getOficinasRegistro);
router.get('/:id', getOficinaRegistroById);
router.post('/', createOficinaRegistro);
router.put('/:id', updateOficinaRegistro);
router.delete('/:id', deleteOficinaRegistro);

export default router;
