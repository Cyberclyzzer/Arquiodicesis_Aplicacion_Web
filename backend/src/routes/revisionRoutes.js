import { Router } from 'express';
import validate from '../middlewares/validate.js';
import { createRevisionSchema, updateRevisionSchema } from '../validations/revision.js';
import {
  getRevisiones,
  getRevisionById,
  createRevision,
  updateRevision,
  deleteRevision,
} from '../controllers/revisionController.js';

const router = Router();

router.get('/', getRevisiones);
router.get('/:id', getRevisionById);
router.post('/', validate(createRevisionSchema), createRevision);
router.put('/:id', validate(updateRevisionSchema), updateRevision);
router.delete('/:id', deleteRevision);

export default router;
