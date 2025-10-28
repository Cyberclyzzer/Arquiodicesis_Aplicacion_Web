import { Router } from 'express';
import {
  getHistorialCambios,
  getHistorialCambioById,
  createHistorialCambio,
  updateHistorialCambio,
  deleteHistorialCambio,
} from '../controllers/historialCambiosController.js';

const router = Router();

router.get('/', getHistorialCambios);
router.get('/:id', getHistorialCambioById);
router.post('/', createHistorialCambio);
router.put('/:id', updateHistorialCambio);
router.delete('/:id', deleteHistorialCambio);

export default router;
