import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, login as apiLogin, register as apiRegister, logout as apiLogout, googleLogin as apiGoogleLogin } from '../../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(r => setUser(r.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const r = await apiLogin(email, password);
    setUser(r.data.user);
    return r.data.user;
  };

  const logout = async () => {
    await apiLogout().catch(() => {});
    setUser(null);
  };

  const register = async (email, password, name) => {
    const r = await apiRegister(email, password, name);
    setUser(r.data.user);
    return r.data.user;
  };

  const googleLogin = async (credential) => {
    const r = await apiGoogleLogin(credential);
    setUser(r.data.user);
    return r.data.user;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);