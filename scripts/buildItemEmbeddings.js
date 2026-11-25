import '../config/loadEnv.js';
import mongoose from 'mongoose';
import axios from 'axios';
import connectDB from '../config/db.js';
import Material from '../models/Material.js';
import Alumni from '../models/Alumni.js';
import Recommendable from '../models/Recommendable.js';

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

const buildMaterialText = (m) =>
  [
    m.title,
    `Subject: ${m.subject}`,
    `Category: ${m.category}`,
    m.branch ? `Branch: ${m.branch}` : '',
    m.semester ? `Semester ${m.semester}` : '',
    m.description || '',
  ]
    .filter(Boolean)
    .join('. ');

const buildAlumniText = (a) =>
  [
    `${a.firstName} ${a.lastName}`,
    `Branch: ${a.branch}`,
    `Graduated: ${a.graduationYear}`,
    `Current role: ${a.currentRole}`,
    `Company: ${a.currentCompany}`,
    a.specialization ? `Specialization: ${a.specialization}` : '',
    (a.skills || []).length ? `Skills: ${a.skills.join(', ')}` : '',
    a.bio || '',
  ]
    .filter(Boolean)
    .join('. ');

const upsertRecommendable = async (doc) => {
  const vec = await embed(doc.text);
  await Recommendable.updateOne(
    { type: doc.type, sourceId: doc.sourceId },
    { $set: { ...doc.fields, itemEmbedding: vec } },
    { upsert: true }
  );
};

const run = async () => {
  await connectDB();
  console.log('✓ MongoDB connected');

  // ---- Materials ----
  const materials = await Material.find({ isVisible: true });
  console.log(`\nMaterials to embed: ${materials.length}`);
  for (let i = 0; i < materials.length; i++) {
    const m = materials[i];
    process.stdout.write(`\r  [${i + 1}/${materials.length}] ${String(m.title).slice(0, 55)}...`);
    try {
      await upsertRecommendable({
        type: 'material',
        sourceId: m._id,
        text: buildMaterialText(m),
        fields: {
          title: m.title,
          subtitle: m.subject,
          meta: {
            branch: m.branch,
            semester: m.semester,
            category: m.category,
          },
        },
      });
    } catch (err) {
      console.error(`\n  ✗ ${m.title}: ${err.message}`);
    }
  }
  console.log('\n✓ Materials done');

  // ---- Alumni ----
  const alumni = await Alumni.find({});
  console.log(`\nAlumni to embed: ${alumni.length}`);
  for (let i = 0; i < alumni.length; i++) {
    const a = alumni[i];
    process.stdout.write(`\r  [${i + 1}/${alumni.length}] ${a.firstName} ${a.lastName}...`);
    try {
      await upsertRecommendable({
        type: 'alumni',
        sourceId: a._id,
        text: buildAlumniText(a),
        fields: {
          title: `${a.firstName} ${a.lastName}`,
          subtitle: `${a.currentRole} @ ${a.currentCompany}`,
          meta: {
            branch: a.branch,
            graduationYear: a.graduationYear,
            currentRole: a.currentRole,
            currentCompany: a.currentCompany,
          },
        },
      });
    } catch (err) {
      console.error(`\n  ✗ ${a.firstName}: ${err.message}`);
    }
  }
  console.log('\n✓ Alumni done');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});