import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { loginUser, registerUser, topupBalance } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [member, setMember] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Load saved user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setMember(user);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Failed to load saved user:', err);
        localStorage.removeItem('auth_user');
      }
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (member && isAuthenticated) {
      localStorage.setItem('auth_user', JSON.stringify(member));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [member, isAuthenticated]);

  const login = async (cardNumber) => {
    const data = await loginUser(cardNumber);
    setMember(data.user);
    setIsAuthenticated(true);
    setStatusMessage('התחברת בהצלחה');
    return data;
  };

  const register = async ({ name, email, password, cardNumber, cardId, idNumber, address, phone, cardName }) => {
    const data = await registerUser({ name, email, password, cardNumber, cardId, idNumber, address, phone, cardName });
    setMember(data.user);
    setIsAuthenticated(true);
    setStatusMessage('ההרשמה הצליחה');
    return data;
  };

  const topup = async (amount) => {
    if (!member) {
      throw new Error('אין משתמש מחובר');
    }

    const data = await topupBalance(member.email, amount);
    setMember((current) => (current ? { ...current, balance: data.balance } : current));
    setStatusMessage(`טען/ה ${amount} ₪ בהצלחה`);
    return data;
  };

  const logout = () => {
    setMember(null);
    setIsAuthenticated(false);
    setStatusMessage('התנתקת בהצלחה');
  };

  const value = useMemo(() => ({
    member,
    isAuthenticated,
    isAdmin: member?.role === 'admin',
    statusMessage,
    setStatusMessage,
    login,
    register,
    topup,
    logout,
  }), [member, isAuthenticated, statusMessage]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
