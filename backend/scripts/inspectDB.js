const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

async function inspectDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:');
  for (const col of collections) {
    const name = col.name;
    const count = await mongoose.connection.db.collection(name).countDocuments();
    const indexes = await mongoose.connection.db.collection(name).indexes();
    console.log(`- ${name}: ${count} docs`);
    console.log(`  indexes:`, indexes.map(i => i.name).join(', '));
  }

  // Check Feedback documents - is there base64 in them?
  const sampleFeedbacks = await mongoose.connection.db.collection('feedbacks').find().limit(5).toArray();
  for (const f of sampleFeedbacks) {
    const size = JSON.stringify(f).length;
    console.log(`Feedback doc ${f._id} size: ${size} chars, has imageUrl: ${Boolean(f.imageUrl)}`);
    if (f.imageUrl && f.imageUrl.length > 500) {
      console.log(`  imageUrl is HUGE (${f.imageUrl.length} chars) - probably base64!`);
    }
  }

  // Check User documents - refreshTokens array size
  const users = await mongoose.connection.db.collection('users').find().toArray();
  for (const u of users) {
    if (u.refreshTokens && u.refreshTokens.length > 5) {
      console.log(`User ${u.email || u.name} has ${u.refreshTokens.length} refreshTokens!`);
    }
  }

  await mongoose.disconnect();
}

inspectDB().catch(console.error);
