import { Router } from 'express';
import {
  getDigitalizaciones,
  getDigitalizacionById,
  createDigitalizacion,
  updateDigitalizacion,
  deleteDigitalizacion,
} from '../controllers/digitalizacionController.js';
import validate from '../middlewares/validate.js';
import { createDigitalizacionSchema, updateDigitalizacionSchema } from '../validations/digitalizacion.js';

const router = Router();

router.get('/', getDigitalizaciones);
router.get('/:id', getDigitalizacionById);
router.post('/', validate(createDigitalizacionSchema), createDigitalizacion);
router.put('/:id', validate(updateDigitalizacionSchema), updateDigitalizacion);
router.delete('/:id', deleteDigitalizacion);

export default router;
