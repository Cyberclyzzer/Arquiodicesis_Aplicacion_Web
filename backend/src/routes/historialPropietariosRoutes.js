import { Router } from 'express';
import {
  getHistorialPropietarios,
  getHistorialPropietarioById,
  createHistorialPropietario,
  updateHistorialPropietario,
  deleteHistorialPropietario,
} from '../controllers/historialPropietariosController.js';

const router = Router();

router.get('/', getHistorialPropietarios);
router.get('/:id', getHistorialPropietarioById);
router.post('/', createHistorialPropietario);
router.put('/:id', updateHistorialPropietario);
router.delete('/:id', deleteHistorialPropietario);

export default router;
