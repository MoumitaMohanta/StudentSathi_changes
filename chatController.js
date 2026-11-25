import axios from 'axios';
import Chunk from '../models/Chunk.js';
import User from '../models/User.js';

// ---------- CONFIG ----------
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const EMBED_MODEL = process.env.EMBED_MODEL || 'nomic-embed-text';
const LLM_MODEL = process.env.LLM_MODEL || 'phi4-mini';

const MODE_LIMITS = {
  explain: 4,
  exam: 12,
  practice: 8,
  summarize: 6,
  doubt: 5,
  general: 0, // not used — general mode skips retrieval entirely
};

// ---------- HELPERS ----------
const stripThinking = (text) => {
  if (!text) return '';
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
};

const embedQuery = async (text) => {
  const res = await axios.post(
    `${OLLAMA_URL}/api/embed`,
    { model: EMBED_MODEL, input: text },
    { timeout: 60000 }
  );
  const vec = res.data?.embeddings?.[0];
  if (!vec?.length) throw new Error('Failed to embed query');
  return vec;
};

const detectIntent = (question) => {
  const q = question.toLowerCase();

  if (/\b(pyq|previous year|past (exam|paper)|last year|question paper)\b/.test(q)) {
    return { category: 'PYQ' };
  }
  if (/\b(syllabus|curriculum|course outline)\b/.test(q)) {
    return { category: 'Syllabus' };
  }
  if (/\b(textbook|book|chapter|lecture notes|reference)\b/.test(q)) {
    return { category: { $in: ['Lecture', 'Notes'] } };
  }
  return null;
};

const buildPrompt = (context, question, mode = 'explain') => {
  const modeInstructions = {
    explain: `Answer the student's question using ONLY the CONTEXT provided below. Explain the concept clearly and thoroughly, as if teaching a student.

STRICT RULES:
1. Use ONLY the CONTEXT. Do NOT use outside knowledge.
2. If the context does not contain the answer, say: "I couldn't find this in the uploaded materials. Try rephrasing, or check your textbook."
3. Cite the source title in brackets where relevant, e.g., [Database Design - 2nd Edition].`,

    exam: `You are extracting exam questions from a set of previous year question papers.

The context contains OCR-extracted text from university exam papers. It is NOISY. It contains:
- Course outcome codes (like CSEN3101.1, CO1, CO2)
- Department headers and "Submission Link" text
- Cognitive level footers (LOCQ, IOCQ, HOCQ)
- Page numbers and stray symbols
- Both questions AND irrelevant boilerplate

YOUR JOB: Extract ONLY the actual exam questions that a student would be asked. Ignore all boilerplate.

STRICT RULES:
1. Extract ONLY items that are genuinely exam questions or question parts.
2. SKIP: course outcomes, "Department & Section Submission Link" text, "LOCQ/IOCQ/HOCQ" footers, page numbers, cover-page information, table-of-contents material.
3. Quote each question EXACTLY as it appears — do not paraphrase or fix grammar.
4. Preserve sub-parts (a, b, c) if they belong to the same question.
5. If a chunk contains no genuine exam questions, ignore it entirely.
6. Do NOT invent questions. Do NOT say "I couldn't find" — just extract whatever real questions exist.

FORMAT:
## Questions from previous papers
1. [verbatim question text]
2. [verbatim question text]

## Topics frequently tested:
- [topic 1]
- [topic 2]`,

    practice: `Extract ONLY genuine exam questions from the CONTEXT that relate to the student's topic.

STRICT RULES:
1. Skip course outcomes, department headers, cognitive-level footers, page numbers.
2. Quote questions verbatim.
3. Number them 1-5.`,

    summarize: `Provide a concise, structured summary of the topic using ONLY the CONTEXT.

STRICT RULES:
1. Use ONLY the CONTEXT.
2. Structure the summary with clear headings.
3. Cite the source title in brackets where relevant.`,

    doubt: `Address the student's confusion directly, using ONLY the CONTEXT.

STRICT RULES:
1. Use ONLY the CONTEXT.
2. If the student is contrasting two concepts, explain the difference clearly.
3. Cite the source title in brackets where relevant.`,

    general: `Answer the student's question from your general knowledge. This is NOT grounded in the uploaded materials.

STRICT RULES:
1. Answer the question clearly.
2. Do NOT pretend the answer came from any context. There is no context for this mode.`,
  };

  const instruction = modeInstructions[mode] || modeInstructions.explain;

  if (mode === 'general') {
    return `${instruction}

STUDENT QUESTION: ${question}

ANSWER:`;
  }

  return `${instruction}

CONTEXT:
${context}

STUDENT QUESTION: ${question}

ANSWER:`;
};

// ---------- MAIN CONTROLLER ----------
export const askQuestion = async (req, res) => {
  try {
    const { question, mode = 'explain' } = req.body;

    if (!question || question.trim().length < 3) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const user = await User.findById(req.userId).select('semester branch');

    let chunks = [];
    let intent = null;
    let context = '(no context retrieved)';

    // ----- GENERAL MODE: skip retrieval entirely -----
    if (mode === 'general') {
      console.log('[chatController] mode=general — skipping retrieval');
    } else {
      // 1. Embed the question
      const queryVector = await embedQuery(question);

      // 2. Build pre-filter from profile + intent
      const preFilter = {};
      if (user?.semester) preFilter.semester = { $eq: user.semester };
      if (user?.branch) preFilter.branch = { $eq: user.branch };

      intent = detectIntent(question);
      if (intent?.category) preFilter.category = intent.category;

      const retrievalLimit = MODE_LIMITS[mode] || 4;

      console.log(
        `[chatController] mode=${mode} limit=${retrievalLimit} intent=${JSON.stringify(intent)} preFilter=${JSON.stringify(preFilter)}`
      );

      // 3. Vector search with pre-filter
      const buildPipeline = (filter) => [
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector,
            numCandidates: 300,
            limit: retrievalLimit,
            ...(Object.keys(filter).length > 0 && { filter }),
          },
        },
        {
          $project: {
            _id: 0,
            text: 1,
            title: 1,
            category: 1,
            subject: 1,
            pageNumber: 1,
            fileUrl: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
      ];

      chunks = await Chunk.aggregate(buildPipeline(preFilter));

      // 4. Fallback: if intent filter returned nothing, retry without category filter
      if (!chunks.length && intent?.category) {
        console.log('[chatController] intent filter returned 0, retrying without it');
        const fallbackFilter = {};
        if (user?.semester) fallbackFilter.semester = { $eq: user.semester };
        if (user?.branch) fallbackFilter.branch = { $eq: user.branch };
        chunks = await Chunk.aggregate(buildPipeline(fallbackFilter));
      }

      // 5. Refuse politely if nothing retrieved
      if (!chunks.length) {
        return res.json({
          answer:
            "I couldn't find relevant information in the available study materials. Try rephrasing, or switch to 'general' mode to get an ungrounded answer.",
          mode,
          intent: intent?.category || 'general',
          sources: [],
        });
      }

      // 6. Build context string
      context = chunks
        .map(
          (c, i) =>
            `[${i + 1}] (${c.title} — ${c.category}${
              c.pageNumber ? ', p. ' + c.pageNumber : ''
            })\n${c.text}`
        )
        .join('\n\n');
    }

    // ----- CALL THE LLM (both modes reach here) -----
    const llmRes = await axios.post(
      `${OLLAMA_URL}/api/chat`,
      {
        model: LLM_MODEL,
        messages: [{ role: 'user', content: buildPrompt(context, question, mode) }],
        stream: false,
        options: { temperature: 0.2, num_ctx: 8192 },
      },
      { timeout: 300000 }
    );

    const rawAnswer = llmRes.data?.message?.content || '';
    const answer = stripThinking(rawAnswer) || 'No response from model.';

    // ----- RESPONSE -----
    res.json({
      answer,
      mode,
      intent: intent?.category || 'general',
      sources:
        mode === 'general'
          ? []
          : chunks.map((c) => ({
              title: c.title,
              category: c.category,
              subject: c.subject,
              page: c.pageNumber,
              fileUrl: c.pageNumber
                ? `${c.fileUrl}#page=${c.pageNumber}`
                : c.fileUrl,
              score: Number(c.score.toFixed(4)),
            })),
    });
  } catch (error) {
    console.error('[chatController]', error.message);
    res.status(500).json({ message: error.message || 'Chat failed' });
  }
};