import { Response } from 'express';
import { Booking, Table, User } from '../models';
import { AuthRequest } from '../middleware';
import { acquireLock, releaseLock } from '../config/redis';

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let userId = (req as any).userId;
    const { tableId, bookingDate, startTime, duration, userId: requestedUserId } = req.body;
    
    const currentUserRole = (req as any).user?.role;
    if (currentUserRole === 'admin' && requestedUserId) {
      userId = requestedUserId;
    }

    const table = await Table.findById(tableId);
    if (!table) {
      res.status(404).json({ message: 'Table not found' });
      return;
    }

    if (table.status === 'maintenance') {
      res.status(400).json({ message: 'Table is under maintenance' });
      return;
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + duration * 60;
    const endTime = minutesToTime(endMinutes);

    const dateStart = new Date(bookingDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(bookingDate);
    dateEnd.setHours(23, 59, 59, 999);

    const existingBooking = await Booking.findOne({
      table: tableId,
      bookingDate: { $gte: dateStart, $lte: dateEnd },
      bookingStatus: { $nin: ['cancelled'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    });

    if (existingBooking) {
      res.status(409).json({ message: 'Time slot already booked' });
      return;
    }

    const userBookings = await Booking.find({
      user: userId,
      bookingDate: { $gte: dateStart, $lte: dateEnd },
      bookingStatus: { $nin: ['cancelled'] },
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    });

    if (userBookings.length > 0) {
      res.status(409).json({ message: 'You have an overlapping booking' });
      return;
    }

    const totalPrice = table.hourlyRate * duration;

    const booking = new Booking({
      user: userId,
      table: tableId,
      bookingDate: new Date(bookingDate),
      startTime,
      endTime,
      duration,
      totalPrice,
      bookingStatus: 'confirmed',
      paymentStatus: 'pending',
    });

    await booking.save();
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error: any) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const bookings = await Booking.find({ user: userId })
      .populate('table', 'tableName tableType hourlyRate')
      .sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const booking = await Booking.findOne({ _id: req.params.id, user: userId });
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    if (booking.bookingStatus === 'cancelled') {
      res.status(400).json({ message: 'Booking already cancelled' });
      return;
    }
    booking.bookingStatus = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAllBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, status } = req.query;
    const filter: any = {};
    if (date) {
      const dateStart = new Date(date as string);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date as string);
      dateEnd.setHours(23, 59, 59, 999);
      filter.bookingDate = { $gte: dateStart, $lte: dateEnd };
    }
    if (status) {
      filter.bookingStatus = status;
    }
    const bookings = await Booking.find(filter)
      .populate('user', 'username email phoneNumber')
      .populate('table', 'tableName tableType hourlyRate')
      .sort({ bookingDate: -1, startTime: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingStatus, paymentStatus } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { bookingStatus, paymentStatus },
      { new: true }
    ).populate('user', 'username email').populate('table', 'tableName tableType');
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAvailableSlots = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tableId, date } = req.query;
    const table = await Table.findById(tableId);
    if (!table) {
      res.status(404).json({ message: 'Table not found' });
      return;
    }

    const dateStart = new Date(date as string);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date as string);
    dateEnd.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      table: tableId,
      bookingDate: { $gte: dateStart, $lte: dateEnd },
      bookingStatus: { $nin: ['cancelled'] },
    }).select('startTime endTime');

    const bookedSlots = bookings.map((b) => ({
      start: b.startTime,
      end: b.endTime,
    }));

    const openHour = 9;
    const closeHour = 23;
    const allSlots = [];
    for (let hour = openHour; hour < closeHour; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    // Filter out past time slots if booking for today
    const now = new Date();
    const isToday = dateStart.toDateString() === now.toDateString();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinutes;

    const availableSlots = allSlots.filter((slot) => {
      const slotMinutes = timeToMinutes(slot);
      
      // If booking for today, only show future time slots
      if (isToday && slotMinutes <= currentTimeMinutes) {
        return false;
      }
      
      // Check if slot is not already booked
      return !bookedSlots.some((bs) => {
        const bsStart = timeToMinutes(bs.start);
        const bsEnd = timeToMinutes(bs.end);
        return slotMinutes >= bsStart && slotMinutes < bsEnd;
      });
    });

    res.json({ table, availableSlots, bookedSlots });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};