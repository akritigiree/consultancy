const mongoose = require('mongoose');
const User = require('./models/User'); // adjust path if needed
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const adminExists = await User.findOne({ email: "admin@example.com" });
    if (adminExists) {
      console.log("⚠️ Admin already exists");
      process.exit();
    }

    const admin = new User({
      name: "Super Admin",
      email: "admin@example.com",
      password: "Admin@123", // will be hashed automatically
      role: "admin",
    });

    await admin.save();
    console.log("🎉 Admin user created:", admin);
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createAdmin();
