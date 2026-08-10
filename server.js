import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './src/backend/routes/authRoutes.js';
import adminRoutes from './src/backend/routes/adminRoutes.js';
import { requireAuth, requireAdmin } from './src/backend/middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/admin', requireAuth, requireAdmin, adminRoutes);

app.post('/api/chat', async (req, res) => {
  const { question, history = [], system } = req.body;
  try {
    const { Resend } = await import('resend');
    // Use Anthropic API via fetch
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        system: system || 'אתה עוזר אישי של מועדון היתרון. ענה תמיד בעברית בקצרה.',
        messages: [...history, { role: 'user', content: question }],
      }),
    });
    if (!response.ok) throw new Error('anthropic error');
    const data = await response.json();
    const answer = (data.content || []).map(b => b.text || '').join('').trim();
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

import { getDatabase } from './src/backend/db/database.js';

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.get('/api/votes', (req, res) => {
  try {
    const db = getDatabase();
    const month = new Date().toISOString().slice(0, 7);
    const rows = db.prepare('SELECT optionId, count FROM votes WHERE month = ?').all(month);
    res.json({ votes: rows, month });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/votes', (req, res) => {
  try {
    const db = getDatabase();
    const { optionId } = req.body;
    const month = new Date().toISOString().slice(0, 7);
    db.prepare(`
      INSERT INTO votes (month, optionId, count) VALUES (?, ?, 1)
      ON CONFLICT(month, optionId) DO UPDATE SET count = count + 1
    `).run(month, optionId);
    const rows = db.prepare('SELECT optionId, count FROM votes WHERE month = ?').all(month);
    res.json({ votes: rows, month });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/community-posts', (req, res) => {
  try {
    const db = getDatabase();
    const posts = db.prepare('SELECT * FROM community_posts WHERE status != ? ORDER BY createdAt DESC').all('hidden');
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/community-posts', (req, res) => {
  try {
    const db = getDatabase();
    const { author, text } = req.body;
    const result = db.prepare('INSERT INTO community_posts (author, text, status) VALUES (?, ?, ?)').run(author || 'אתם', text, 'visible');
    const post = db.prepare('SELECT * FROM community_posts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
