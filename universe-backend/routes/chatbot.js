const router = require('express').Router();
const { Notice, Assignment, Course, Fee } = require('../models/models');

// Node versions may not have global fetch enabled
const fetchFn = global.fetch || (() => {
  try {
    return require('node-fetch');
  } catch (e) {
    return null;
  }
})();

function fetch(url, options) {
  if (!fetchFn) throw new Error('fetch is not available in this Node runtime. Install node-fetch or upgrade Node.');
  return fetchFn(url, options);
}


const OPENAI_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

function normalizeText(text) {
  return (text || '').toString().toLowerCase();
}

function truncateText(text, length = 150) {
  if (!text) return '';
  return text.length <= length ? text : text.slice(0, length).trim() + '...';
}

function buildBasicContext(message, userRole, userName, userEmail) {
  const identityLines = [`Role: ${userRole || 'guest'}`];
  if (userName) identityLines.push(`Name: ${userName}`);
  if (userEmail) identityLines.push(`Email: ${userEmail}`);
  return `User context:\n${identityLines.join(' | ')}\n\n`; 
}

function selectRelevantNotices(notices, message) {
  const normalized = normalizeText(message);
  if (/fee|payment|due|overdue/.test(normalized)) {
    return notices.filter(n => /fee|payment|due|overdue|tuition/.test(normalizeText(n.title + ' ' + n.content))).slice(0, 5);
  }
  if (/assignment|homework|task|due date|deadline/.test(normalized)) {
    return notices.filter(n => /assignment|homework|task|deadline|due date/.test(normalizeText(n.title + ' ' + n.content))).slice(0, 5);
  }
  if (/attendance|present|absent|class|schedule|timetable/.test(normalized)) {
    return notices.filter(n => /attendance|class|schedule|timetable|exam|holiday/.test(normalizeText(n.title + ' ' + n.content))).slice(0, 5);
  }
  return notices.slice(0, 5);
}

function buildKnowledgeSection(notices, assignments, courses, fees, message) {
  const relevantNotices = selectRelevantNotices(notices, message);
  const noticeSummary = relevantNotices.length
    ? relevantNotices.map(n => `- ${n.title} [${n.type}] (${n.postedBy?.name || 'Staff'}): ${truncateText(n.content, 120)}`).join('\n')
    : '- No relevant notices found.';

  const assignmentSummary = assignments.length
    ? assignments.slice(0, 6).map(a => `- ${truncateText(a.title, 50)} for ${a.courseId?.name || 'Unknown course'} due ${a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A'}`).join('\n')
    : '- No assignments available.';

  const courseSummary = courses.length
    ? courses.slice(0, 6).map(c => `- ${c.name} (${c.code})`).join('\n')
    : '- No active courses available.';

  const feeSummary = fees.length
    ? fees.slice(0, 6).map(f => `- ${truncateText(f.description, 50)}: ₹${f.amount} | Status: ${f.status} | Due: ${f.dueDate ? new Date(f.dueDate).toLocaleDateString() : 'N/A'}`).join('\n')
    : '- No pending fee records available.';

  const relevantSection = /fee|payment|due|overdue/.test(normalizeText(message))
    ? `Relevant fee details:\n${feeSummary}\n\nRelevant notices:\n${noticeSummary}`
    : /assignment|homework|task|deadline|due date/.test(normalizeText(message))
      ? `Relevant assignments:\n${assignmentSummary}\n\nRelevant notices:\n${noticeSummary}`
      : /attendance|class|schedule|timetable|exam|holiday/.test(normalizeText(message))
        ? `Relevant notices:\n${noticeSummary}\n\nUpcoming assignments:\n${assignmentSummary}`
        : `Latest announcements:\n${noticeSummary}\n\nActive courses:\n${courseSummary}`;

  return `Campus knowledge base:\n${relevantSection}\n\nNote: Answer using only the information available in this campus knowledge base and the user's request. If the answer requires details not present here, tell the user to check the KD Campus app or contact the admin.`;
}

async function buildKnowledgeContext(message, userRole, userName, userEmail) {
  const [notices, assignments, courses, fees] = await Promise.all([
    Notice.find({ isActive: true }).populate('postedBy', 'name').sort({ createdAt: -1 }).limit(12),
    Assignment.find({}).populate('courseId', 'name code').sort({ dueDate: 1 }).limit(12),
    Course.find({ isActive: true }).sort({ name: 1 }).limit(12),
    Fee.find({ status: { $in: ['pending', 'overdue'] } }).sort({ dueDate: 1 }).limit(12),
  ]);

  const userContext = buildBasicContext(message, userRole, userName, userEmail);
  const knowledgeSection = buildKnowledgeSection(notices, assignments, courses, fees, message);
  return `${userContext}${knowledgeSection}`;
}

router.post('/', async (req, res) => {
  try {
    const message = req.body.message?.trim();
    const userRole = req.body.userRole || 'guest';
    const userName = req.body.userName || '';
    const userEmail = req.body.userEmail || '';
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const knowledgeContext = await buildKnowledgeContext(message, userRole, userName, userEmail);

    if (OPENAI_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are UniBot, a helpful university assistant for KD Campus. Answer student questions concisely and kindly, using the campus knowledge base wherever possible.' },
            { role: 'system', content: knowledgeContext },
            { role: 'user', content: message }
          ],
          temperature: 0.2,
          max_tokens: 450
        })
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({ success: false, message: data.error?.message || 'OpenAI request failed.' });
      }

      const reply = data.choices?.[0]?.message?.content?.trim();
      return res.json({ success: true, reply: reply || 'I am here to help, but I could not generate a response.' });
    }

    if (ANTHROPIC_KEY) {
      const response = await fetch('https://api.anthropic.com/v1/chat.completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': ANTHROPIC_KEY
        },
        body: JSON.stringify({
          model: 'claude-3.5-mini',
          messages: [
            { role: 'system', content: 'You are UniBot, a helpful university assistant for KD Campus. Answer questions kindly and clearly, using the campus knowledge base wherever possible.' },
            { role: 'system', content: knowledgeContext },
            { role: 'user', content: message }
          ],
          max_tokens_to_sample: 450,
          temperature: 0.2
        })
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({ success: false, message: data.error?.message || 'Anthropic request failed.' });
      }

      const reply = data.completion?.trim() || data.choices?.[0]?.message?.content?.trim();
      return res.json({ success: true, reply: reply || 'I am here to help, but I could not generate a response.' });
    }

    return res.status(503).json({ success: false, message: 'AI assistant is not configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY on the backend.' });
  } catch (err) {
    console.error('Chatbot route error:', err.message || err);
    return res.status(500).json({ success: false, message: 'Chatbot service error.' });
  }
});

// (optional) kept for future safety improvements
// function safeJsonParse(text) {
//   try { return JSON.parse(text); } catch { return null; }
// }

module.exports = router;


