import { Router } from 'express';
import {
  getPartes,
  getParteById,
  createParte,
  updateParte,
  deleteParte,
} from '../controllers/parteController.js';
import validate from '../middlewares/validate.js';
import { createParteSchema, updateParteSchema } from '../validations/parte.js';

const router = Router();

router.get('/', getPartes);
router.get('/:id', getParteById);
router.post('/', validate(createParteSchema), createParte);
router.put('/:id', validate(updateParteSchema), updateParte);
router.delete('/:id', deleteParte);

export default router;
