import { loginUser, registerUser, topupUser } from '../services/userService.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import { assignUserCard, validateCardId } from '../services/cardService.js';

export async function registerController(req, res) {
  try {
    if (req.body.cardId && !validateCardId(req.body.cardId)) {
      const error = new Error('הכרטיס שנבחר לא נמצא');
      error.statusCode = 400;
      throw error;
    }
    const user = registerUser(req.body);
    if (req.body.cardId) {
      assignUserCard(user.id, req.body.cardId);
    }
    // send welcome email in background, don't block response
    sendWelcomeEmail({ name: user.name, email: user.email, cardNumber: user.cardNumber })
      .then(result => console.log('Email sent:', JSON.stringify(result)))
      .catch(err => console.error('Email error:', err.message));
    res.status(201).json({ success: true, user, token: 'demo-jwt-token' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'שגיאה בהרשמה' });
  }
}

export function loginController(req, res) {
  try {
    const user = loginUser(req.body.cardNumber);
    res.json({ success: true, user, token: 'demo-jwt-token' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'שגיאה בהתחברות' });
  }
}

export function topupController(req, res) {
  try {
    const user = topupUser(req.body.email, req.body.amount);
    res.json({ success: true, balance: user.balance });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'שגיאה בטעינה' });
  }
}
