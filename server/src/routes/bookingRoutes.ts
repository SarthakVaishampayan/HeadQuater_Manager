import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  getAvailableSlots,
} from '../controllers/bookingController';
import { auth, admin } from '../middleware';
import { validate } from '../middleware/validate';
import { bookingSchema, updateBookingSchema } from '../schemas';

const router = Router();

router.post('/', auth, validate(bookingSchema), createBooking);
router.get('/my-bookings', auth, getMyBookings);
router.get('/available', getAvailableSlots);
router.get('/admin', auth, admin, getAllBookings);
router.put('/:id', auth, admin, validate(updateBookingSchema), updateBookingStatus);
router.delete('/:id', auth, cancelBooking);

export default router;