import { Router } from 'express';
import { getDashboardStats, getAllUsers, getUserStats } from '../controllers/analyticsController';
import { auth, admin } from '../middleware';

const router = Router();

router.get('/dashboard', auth, admin, getDashboardStats);
router.get('/users', auth, admin, getAllUsers);
router.get('/stats', auth, admin, getUserStats);

export default router;