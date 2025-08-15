const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Admin data
const admins = [
  {
    username: 'super',
    password: 'super123',
    role: 'super'
  },
  {
    username: 'sub',
    password: 'sub123',
    role: 'sub'
  }
];

// Seed function
const seedAdmins = async () => {
  try {
    // Clear existing admins
    await Admin.deleteMany();
    console.log('Cleared existing admins');

    // Hash passwords and create admins
    for (const admin of admins) {
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      await Admin.create({
        username: admin.username,
        password: hashedPassword,
        role: admin.role
      });
      console.log(`Created ${admin.role} admin: ${admin.username}`);
    }

    console.log('Admin seeding completed!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admins:', err);
    process.exit(1);
  }
};

// Run seeder
seedAdmins();