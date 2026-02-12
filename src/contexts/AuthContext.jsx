import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar estado inicial desde localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('readerToken');
    const savedUser = localStorage.getItem('readerUser');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Verificar token y suscripción
      checkAuth(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Verificar autenticación y suscripción
  const checkAuth = async (authToken) => {
    try {
      // Verificar token válido
      const meResponse = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (!meResponse.ok) {
        throw new Error('Token inválido');
      }

      const userData = await meResponse.json();
      setUser(userData);

      // Verificar suscripción
      const subResponse = await fetch(`${API_URL}/subscriptions/status`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (subResponse.ok) {
        const subData = await subResponse.json();
        setIsSubscribed(subData.isSubscribed);
      }
    } catch (error) {
      // Token inválido, limpiar estado
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al iniciar sesión');
    }

    const data = await response.json();

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('readerToken', data.token);
    localStorage.setItem('readerUser', JSON.stringify(data.user));

    // Verificar suscripción
    await checkSubscriptionStatus(data.token);

    return data;
  };

  // Registro
  const register = async (name, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al registrarse');
    }

    const data = await response.json();

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('readerToken', data.token);
    localStorage.setItem('readerUser', JSON.stringify(data.user));

    return data;
  };

  // Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsSubscribed(false);
    localStorage.removeItem('readerToken');
    localStorage.removeItem('readerUser');
  };

  // Verificar estado de suscripción
  const checkSubscriptionStatus = async (authToken = token) => {
    if (!authToken) return false;

    try {
      const response = await fetch(`${API_URL}/subscriptions/status`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        setIsSubscribed(data.isSubscribed);
        return data.isSubscribed;
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
    return false;
  };

  const value = {
    user,
    token,
    isSubscribed,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    checkSubscriptionStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

export default AuthContext;
