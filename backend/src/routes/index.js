import express from 'express';
import tipoBienRouter from '../controllers/tipoBien.js';

const router = express.Router();

router.use('/tipos-bien', tipoBienRouter);

export default router;