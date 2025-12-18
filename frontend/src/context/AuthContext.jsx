import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('homigo_user');
    const storedToken = localStorage.getItem('homigo_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        localStorage.removeItem('homigo_user');
        localStorage.removeItem('homigo_token');
      }
    }
    setInitialized(true);
  }, []);

  const login = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem('homigo_user', JSON.stringify(nextUser));
    localStorage.setItem('homigo_token', nextToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('homigo_user');
    localStorage.removeItem('homigo_token');
  };

  const value = useMemo(
    () => ({
      user,
      token,
      initialized,
      login,
      logout,
    }),
    [user, token, initialized]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

