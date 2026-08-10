import { findUserByEmail } from '../services/userService.js';

export function requireAuth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  if (token !== 'demo-jwt-token') return res.status(401).json({ error: 'Invalid token' });
  next();
}

export function requireAdmin(req, res, next) {
  const email = req.headers['x-user-email'];
  if (!email) return res.status(403).json({ error: 'Forbidden' });
  const user = findUserByEmail(email);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Forbidden — admins only' });
  next();
}
