import { Server } from 'socket.io';
import { Table, Booking } from '../models';

export const setupSockets = (io: Server): void => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join:admin', () => {
      socket.join('admin');
    });

    socket.on('join:table', (tableId: string) => {
      socket.join(`table:${tableId}`);
    });
  });

  io.on('disconnect', () => {
    console.log('Client disconnected');
  });
};

export const emitTableUpdate = async (io: Server): Promise<void> => {
  const tables = await Table.find({ isActive: true });
  io.emit('tables:update', tables);
};

export const emitBookingUpdate = async (io: Server, date?: string): Promise<void> => {
  const filter: any = {};
  if (date) {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);
    filter.bookingDate = { $gte: dateStart, $lte: dateEnd };
  }
  const bookings = await Booking.find(filter)
    .populate('user', 'username email')
    .populate('table', 'tableName tableType')
    .sort({ bookingDate: 1, startTime: 1 });

  io.to('admin').emit('bookings:update', bookings);
};