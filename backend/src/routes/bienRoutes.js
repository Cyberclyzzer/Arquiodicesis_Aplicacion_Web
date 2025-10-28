import { Router } from 'express';
import {
  getBienes,
  getBienById,
  createBien,
  updateBien,
  deleteBien,
} from '../controllers/bienController.js';
import validate from '../middlewares/validate.js';
import { createBienSchema, updateBienSchema } from '../validations/bien.js';

const router = Router();

router.get('/', getBienes);
router.get('/:id', getBienById);
router.post('/', validate(createBienSchema), createBien);
router.put('/:id', validate(updateBienSchema), updateBien);
router.delete('/:id', deleteBien);

export default router;
