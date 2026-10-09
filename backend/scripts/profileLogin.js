const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Student = require('../models/student');

async function profileLogin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');

  for (let i = 1; i <= 3; i++) {
    console.log(`\n--- Run ${i} ---`);
    let t0 = Date.now();
    const identifier = 'admin@hostel.com';
    const password = 'admin123';

    // Step 1: Student.findOne
    let t = Date.now();
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const studentMatch = await Student.findOne({
      Rollno: { $regex: new RegExp("^" + escapeRegex(identifier) + "$", "i") },
    });
    console.log(`Step 1 (Student.findOne regex): ${Date.now() - t} ms`);

    // Step 2: User.findOne
    t = Date.now();
    const cleanLower = identifier.toLowerCase();
    const user = await User.findOne({
      $or: [
        { email: cleanLower },
        { name: { $regex: new RegExp("^" + escapeRegex(identifier) + "$", "i") } },
      ],
    }).populate("student");
    console.log(`Step 2 (User.findOne with populate): ${Date.now() - t} ms`);

    // Step 3: bcrypt.compare
    t = Date.now();
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Step 3 (bcrypt.compare): ${Date.now() - t} ms`);

    // Step 4: user.save (refresh token push)
    t = Date.now();
    user.refreshTokens.push('dummy_refresh_token_' + Date.now());
    await user.save();
    console.log(`Step 4 (user.save with refreshTokens): ${Date.now() - t} ms`);

    console.log(`TOTAL login steps: ${Date.now() - t0} ms`);
  }

  await mongoose.disconnect();
}

profileLogin().catch(console.error);
