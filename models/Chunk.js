import mongoose from 'mongoose';

const chunkSchema = new mongoose.Schema(
  {
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true, index: true },
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    chunkIndex: { type: Number, required: true },
    pageNumber: { type: Number, default: null },
    title: String,
    category: String,
    subject: String,
    semester: Number,
    branch: String,
    fileUrl: String,
  },
  { timestamps: true }
);

export default mongoose.models.Chunk || mongoose.model('Chunk', chunkSchema);