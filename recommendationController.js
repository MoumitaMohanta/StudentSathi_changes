import User from '../models/User.js';
import Recommendable from '../models/Recommendable.js';

const K_MATERIALS = 6;
const K_ALUMNI = 4;

export const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+profileEmbedding');

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.profileEmbedding?.length) {
      return res.json({
        materials: [],
        alumni: [],
        reason: 'Profile embedding not generated yet.',
      });
    }

    const queryVector = user.profileEmbedding;

    // Fetch extra candidates, then split by type in JS
    const results = await Recommendable.aggregate([
      {
        $vectorSearch: {
          index: 'recommendables_vector_index',
          path: 'itemEmbedding',
          queryVector,
          numCandidates: 200,
          limit: 40,
        },
      },
      {
        $project: {
          type: 1,
          sourceId: 1,
          title: 1,
          subtitle: 1,
          meta: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ]);

    const materials = results
      .filter((r) => r.type === 'material')
      .slice(0, K_MATERIALS);
    const alumni = results
      .filter((r) => r.type === 'alumni')
      .slice(0, K_ALUMNI);

    res.json({ materials, alumni });
  } catch (err) {
    console.error('[recommendations]', err.message);
    res.status(500).json({ message: err.message });
  }
};