// resetClientPassword.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Client = require('./models/Client'); // make sure path is correct

async function resetClientPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // CHANGE THESE VALUES
    const email = "client1@example.com";  // client's email
    const newPassword = "Client@123";     // new password you want

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Find client and update password
    const client = await Client.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!client) {
      console.log("❌ Client not found");
    } else {
      console.log(`🎉 Password reset successfully for ${email}`);
    }

    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

resetClientPassword();
