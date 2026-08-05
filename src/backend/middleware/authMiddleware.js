export function requireAuth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  if (token !== 'demo-jwt-token') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  next();
}
