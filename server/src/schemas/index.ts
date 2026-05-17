import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const tableSchema = z.object({
  tableName: z.string().min(1, 'Table name is required'),
  tableType: z.enum(['pool', 'snooker', 'vip']),
  hourlyRate: z.number().positive('Hourly rate must be positive'),
  status: z.enum(['available', 'occupied', 'maintenance']).optional(),
});

export const updateTableSchema = z.object({
  tableName: z.string().min(1).optional(),
  tableType: z.enum(['pool', 'snooker', 'vip']).optional(),
  hourlyRate: z.number().positive().optional(),
  status: z.enum(['available', 'occupied', 'maintenance']).optional(),
  isActive: z.boolean().optional(),
});

export const bookingSchema = z.object({
  tableId: z.string().min(1, 'Table ID is required'),
  bookingDate: z.string().transform((val) => new Date(val)),
  startTime: z.string().min(1, 'Start time is required'),
  duration: z.number().positive('Duration must be positive').min(1).max(8),
  userId: z.string().optional(), // For admin to book for other users
});

export const updateBookingSchema = z.object({
  bookingStatus: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'refunded']).optional(),
});