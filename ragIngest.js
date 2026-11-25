// backend/scripts/ragIngest.js
import '../config/loadEnv.js';
import mongoose from 'mongoose';
import axios from 'axios';
import { createRequire } from 'module';
import connectDB from '../config/db.js';
import Material from '../models/Material.js';

// pdf-parse is CommonJS; use createRequire to load it cleanly in ESM

const require = createRequire(import.meta.url);
const pdfModule = require('pdf-parse');

// Handle multiple possible export shapes
const pdf =
  typeof pdfModule === 'function'
    ? pdfModule
    : typeof pdfModule?.default === 'function'
    ? pdfModule.default
    : typeof pdfModule?.pdf === 'function'
    ? pdfModule.pdf
    : null;

if (!pdf) {
  console.error('pdf-parse export shape:', pdfModule);
  console.error('typeof module:', typeof pdfModule);
  console.error('keys:', Object.keys(pdfModule));
  throw new Error('Cannot determine pdf-parse API — try npm install pdf-parse@1.1.1');
}


// ---------- CONFIG ----------
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const EMBED_MODEL = process.env.EMBED_MODEL || 'nomic-embed-text';
const CHUNK_SIZE = 900;      // characters per chunk
const CHUNK_OVERLAP = 150;   // overlap between chunks

// ---------- CHUNK SCHEMA ----------
const chunkSchema = new mongoose.Schema(
  {
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true, index: true },
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    chunkIndex: { type: Number, required: true },
    pageNumber: { type: Number, default: null },
    // denormalized metadata copied from the parent Material
    title: String,
    category: String,
    subject: String,
    semester: Number,
    branch: String,
    fileUrl: String,
  },
  { timestamps: true }
);

const Chunk = mongoose.models.Chunk || mongoose.model('Chunk', chunkSchema);

// ---------- HELPERS ----------
const chunkText = (text, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) => {
  const clean = text.replace(/\s+/g, ' ').trim();
  const chunks = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(i + size, clean.length);
    chunks.push({ text: clean.slice(i, end), start: i });
    if (end === clean.length) break;
    i = end - overlap;
  }
  return chunks;
};

const getEmbedding = async (text) => {
  const res = await axios.post(
    `${OLLAMA_URL}/api/embed`,
    { model: EMBED_MODEL, input: text },
    { timeout: 60000 }
  );
  const vec = res.data?.embeddings?.[0];
  if (!vec || !vec.length) throw new Error('Ollama returned no embedding');
  return vec;
};


const downloadPdf = async (url) => {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 120000 });
  return Buffer.from(res.data);
};

// ---------- MAIN ----------
const run = async () => {
  await connectDB();
  console.log('✓ Connected to MongoDB');

  // Check Ollama is up
  try {
    await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
    console.log(`✓ Ollama reachable at ${OLLAMA_URL}`);
  } catch {
    console.error(`✗ Cannot reach Ollama at ${OLLAMA_URL}. Is it running? Try: ollama serve`);
    process.exit(1);
  }

  const materials = await Material.find({ isVisible: true });
  console.log(`\nFound ${materials.length} materials in DB\n`);

  let totalChunks = 0;

  for (const material of materials) {
    console.log(`=== ${material.title} [${material.category}] ===`);

    if (!material.fileUrl) { console.log('  skip: no fileUrl\n'); continue; }
    if (material.fileType !== 'pdf') {
      console.log(`  skip: fileType "${material.fileType}" — only PDF supported for now\n`);
      continue;
    }

    const existing = await Chunk.countDocuments({ materialId: material._id });
    if (existing > 0) {
      console.log(`  skip: already ingested (${existing} chunks)\n`);
      continue;
    }

    try {
      console.log('  downloading PDF...');
      const buffer = await downloadPdf(material.fileUrl);

      console.log('  extracting text...');
      const parsed = await pdf(buffer);
      const text = parsed.text || '';
      const numPages = parsed.numpages || 1;

      if (text.trim().length < 50) {
        console.log('  skip: no extractable text (possibly a scanned PDF)\n');
        continue;
      }

      const chunks = chunkText(text);
      console.log(`  ${numPages} pages, ${text.length} chars → ${chunks.length} chunks`);

      const docs = [];
      for (let i = 0; i < chunks.length; i++) {
        const { text: chunkStr, start } = chunks[i];
        process.stdout.write(`\r  embedding chunk ${i + 1}/${chunks.length}...`);

        const embedding = await getEmbedding(chunkStr);
        const approxPage = Math.min(
          numPages,
          Math.floor((start / Math.max(text.length, 1)) * numPages) + 1
        );

        docs.push({
          materialId: material._id,
          text: chunkStr,
          embedding,
          chunkIndex: i,
          pageNumber: approxPage,
          title: material.title,
          category: material.category,
          subject: material.subject,
          semester: material.semester ?? null,
          branch: material.branch ?? null,
          fileUrl: material.fileUrl,
        });
      }

      await Chunk.insertMany(docs);
      totalChunks += docs.length;
      console.log(`\n  ✓ saved ${docs.length} chunks\n`);
    } catch (err) {
      console.error(`\n  ✗ ERROR: ${err.message}\n`);
    }
  }

  console.log(`\n✓ Done. Total chunks stored this run: ${totalChunks}`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});