import { connectDB } from './config/database';
import { User } from './models';

const resetAdmin = async () => {
  await connectDB();
  
  // Update existing admin or create new
  const updated = await User.findOneAndUpdate(
    { role: 'admin' },
    { 
      email: 'admin@gmail.com',
      username: 'admin'
    },
    { new: true }
  );
  
  if (updated) {
    // Reset password
    updated.password = 'admin123';
    await updated.save();
    console.log('Admin updated: admin@gmail.com / admin123');
  }
  
  process.exit(0);
};

resetAdmin();