const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const Allocation = require('../models/Allocation');
const Room = require('../models/Room');
const User = require('../models/User');
const Student = require('../models/student');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');

async function createIndexes() {
  await mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: 20,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
  });
  console.log('Connected to MongoDB Atlas');

  console.log('Creating indexes for Allocation...');
  await Allocation.collection.createIndex({ status: 1 });
  await Allocation.collection.createIndex({ studentId: 1, status: 1 });
  await Allocation.collection.createIndex({ roomId: 1, status: 1 });
  await Allocation.collection.createIndex({ allocatedDate: -1 });

  console.log('Creating indexes for Room...');
  await Room.collection.createIndex({ RoomNo: 1, Block: 1 });
  await Room.collection.createIndex({ Block: 1, Floor: 1, RoomNo: 1 });

  console.log('Creating indexes for User...');
  await User.collection.createIndex({ student: 1 });
  await User.collection.createIndex({ role: 1 });

  console.log('Creating indexes for Feedback...');
  await Feedback.collection.createIndex({ studentId: 1, createdAt: -1 });
  await Feedback.collection.createIndex({ status: 1 });
  await Feedback.collection.createIndex({ createdAt: -1 });

  console.log('Creating indexes for Notification...');
  await Notification.collection.createIndex({ targetType: 1, targetValue: 1, createdAt: -1 });
  await Notification.collection.createIndex({ createdAt: -1 });

  console.log('All indexes created successfully!');
  await mongoose.disconnect();
}

createIndexes().catch(console.error);
