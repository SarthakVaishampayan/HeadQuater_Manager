import { Response } from 'express';
import { Booking, Table, User } from '../models';
import { AuthRequest } from '../middleware';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRevenue = await Booking.aggregate([
      {
        $match: {
          bookingDate: { $gte: today, $lt: tomorrow },
          paymentStatus: 'paid',
        },
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    const activeBookings = await Booking.countDocuments({
      bookingStatus: 'confirmed',
      bookingDate: { $gte: today, $lt: tomorrow },
    });

    const totalTables = await Table.countDocuments({ isActive: true });

    const tables = await Table.find({ isActive: true });
    const occupiedTables = tables.filter((t) => t.status === 'occupied').length;

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$bookingDate' } },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const topTables = await Booking.aggregate([
      { $match: { bookingStatus: { $nin: ['cancelled'] } } },
      { $group: { _id: '$table', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'tables',
          localField: '_id',
          foreignField: '_id',
          as: 'tableInfo',
        },
      },
      { $unwind: '$tableInfo' },
      {
        $project: {
          tableName: '$tableInfo.tableName',
          tableType: '$tableInfo.tableType',
          bookingCount: '$count',
        },
      },
    ]);

    const peakHours = await Booking.aggregate([
      { $match: { bookingStatus: { $nin: ['cancelled'] } } },
      {
        $group: {
          _id: { $substr: ['$startTime', 0, 2] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      todayRevenue: todayRevenue[0]?.total || 0,
      totalRevenue: totalRevenue[0]?.total || 0,
      activeBookings,
      totalTables,
      occupiedTables,
      occupancyRate: totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0,
      monthlyRevenue,
      topTables,
      peakHours,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Admin can see all users including themselves for creating bookings
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalBookings = await Booking.countDocuments();
    const avgBookingValue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, avg: { $avg: '$totalPrice' } } },
    ]);
    res.json({
      totalUsers,
      totalBookings,
      avgBookingValue: avgBookingValue[0]?.avg || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};