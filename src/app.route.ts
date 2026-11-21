import { Router } from 'express';
import authRoutes from '@/modules/auth/auth.route.js';
import fileRoutes from '@/modules/file/file.route.js';
import syncRoutes from '@/modules/sync/sync.route.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/files', fileRoutes);
router.use('/sync', syncRoutes);

export default router;
