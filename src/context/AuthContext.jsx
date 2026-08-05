import { createContext, useContext, useMemo, useState } from 'react';
import { loginUser, registerUser, topupBalance } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [member, setMember] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    setMember(data.user);
    setIsAuthenticated(true);
    setStatusMessage('התחברת בהצלחה');
    return data;
  };

  const register = async ({ name, email, password, cardNumber }) => {
    const data = await registerUser({ name, email, password, cardNumber });
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
