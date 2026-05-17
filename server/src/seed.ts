import { User, Table } from './models';

export const seedDatabase = async (): Promise<void> => {
  try {
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        email: 'admin@gmail.com',
        password: 'admin123',
        phoneNumber: '9876543210',
        role: 'admin',
      });
      await admin.save();
      console.log('Admin user created: admin@gmail.com / admin123');
    }

    const tableCount = await Table.countDocuments();
    if (tableCount === 0) {
      const tables = [
        { tableName: 'Table 1', tableType: 'pool', hourlyRate: 200, status: 'available' },
        { tableName: 'Table 2', tableType: 'pool', hourlyRate: 200, status: 'available' },
        { tableName: 'Table 3', tableType: 'snooker', hourlyRate: 300, status: 'available' },
        { tableName: 'Table 4', tableType: 'snooker', hourlyRate: 300, status: 'available' },
        { tableName: 'VIP Table 1', tableType: 'vip', hourlyRate: 500, status: 'available' },
      ];
      await Table.insertMany(tables);
      console.log('Default tables created');
    }
  } catch (error) {
    console.error('Seed error:', error);
  }
};