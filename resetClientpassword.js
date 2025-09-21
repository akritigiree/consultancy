// resetClientPassword.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Client = require('./models/Client'); // make sure path matches your file

const email = "client1@example.com";  // client email from DB
const newPassword = "Client@123";     // new password you want to set

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const client = await Client.findOne({ email });
    if (!client) {
      console.log("❌ Client not found");
      process.exit();
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    client.password = hashedPassword;

    await client.save();
    console.log(`✅ Password updated successfully for ${email}`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
