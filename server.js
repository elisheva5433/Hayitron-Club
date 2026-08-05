import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './src/backend/routes/authRoutes.js';
import adminRoutes from './src/backend/routes/adminRoutes.js';
import { requireAuth } from './src/backend/middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/admin', requireAuth, adminRoutes);

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
