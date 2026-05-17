import { Router } from 'express';
import authRoutes from './authRoutes';
import tableRoutes from './tableRoutes';
import bookingRoutes from './bookingRoutes';
import analyticsRoutes from './analyticsRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tables', tableRoutes);
router.use('/bookings', bookingRoutes);
router.use('/analytics', analyticsRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Pool & Snooker API is running' });
});

export default router;