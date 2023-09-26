import express from 'express';
import { Router } from 'express';
import UserRoutes from './user/routes';

const router:Router = express.Router();

router.use('/user', UserRoutes);

export default router;