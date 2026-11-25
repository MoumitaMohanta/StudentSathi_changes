import mongoose from 'mongoose';

const recommendableSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['material', 'alumni'],
      required: true,
      index: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    // Denormalized display fields (so the recommender doesn't need to $lookup)
    title: String,        // material title or alumni full name
    subtitle: String,     // subject or currentRole @ company
    meta: {
      branch: String,
      semester: Number,
      category: String,
      graduationYear: Number,
      currentCompany: String,
      currentRole: String,
    },
    itemEmbedding: {
      type: [Number],
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

recommendableSchema.index({ type: 1, sourceId: 1 }, { unique: true });

export default mongoose.model('Recommendable', recommendableSchema);