const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testIPv4() {
  console.log('Testing connection with ipv4first...');
  const t0 = Date.now();
  await mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: 50,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  console.log(`Connected in ${Date.now() - t0} ms!`);

  // Run 5 queries in parallel
  const t1 = Date.now();
  const Student = require('../models/student');
  const Room = require('../models/Room');
  const Allocation = require('../models/Allocation');
  const User = require('../models/User');

  const [s, r, a, u] = await Promise.all([
    Student.find().limit(50).lean(),
    Room.find().limit(50).lean(),
    Allocation.find().limit(50).lean(),
    User.find().limit(50).lean(),
  ]);

  console.log(`Parallel queries took: ${Date.now() - t1} ms`);
  console.log(`Results: ${s.length} students, ${r.length} rooms, ${a.length} allocations, ${u.length} users`);

  await mongoose.disconnect();
}

testIPv4().catch(console.error);
