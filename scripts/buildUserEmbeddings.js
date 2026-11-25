import '../config/loadEnv.js';
import mongoose from 'mongoose';
import axios from 'axios';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const EMBED_MODEL = process.env.EMBED_MODEL || 'nomic-embed-text';

const embed = async (text) => {
  const res = await axios.post(
    `${OLLAMA_URL}/api/embed`,
    { model: EMBED_MODEL, input: text },
    { timeout: 60000 }
  );
  const vec = res.data?.embeddings?.[0];
  if (!vec?.length) throw new Error('No embedding returned');
  return vec;
};

const buildProfileText = (u) => {
  const skillNames = (u.skills || []).map((s) => s.name).filter(Boolean);
  return [
    `Student in ${u.branch || 'unknown branch'}`,
    u.semester ? `Semester ${u.semester}` : '',
    (u.interests || []).length ? `Interests: ${u.interests.join(', ')}` : '',
    u.targetRole ? `Target career role: ${u.targetRole}` : '',
    skillNames.length ? `Skills: ${skillNames.join(', ')}` : '',
    u.bio ? `About: ${u.bio}` : '',
  ]
    .filter(Boolean)
    .join('. ');
};

const run = async () => {
  await connectDB();
  console.log('✓ MongoDB connected');

  const users = await User.find({ role: 'student' });
  console.log(`\nStudents to embed: ${users.length}`);

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    process.stdout.write(
      `\r  [${i + 1}/${users.length}] ${u.firstName} ${u.lastName}...`
    );
    try {
      const text = buildProfileText(u);
      const vec = await embed(text);
      await User.updateOne(
        { _id: u._id },
        { $set: { profileEmbedding: vec, embeddingUpdatedAt: new Date() } }
      );
    } catch (err) {
      console.error(`\n  ✗ ${u.firstName}: ${err.message}`);
    }
  }
  console.log('\n✓ Users done');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});