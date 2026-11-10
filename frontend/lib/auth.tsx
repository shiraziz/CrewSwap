import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearTokens, loadStoredTokens, setTokens } from './api';

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  status: string;
};

export type Profile = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  rank?: string | null;
  user?: AuthUser;
};

type AuthContextValue = {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  register(input: { email: string; password: string; firstName: string; lastName: string; rank?: string }): Promise<void>;
  refreshMe(): Promise<void>;
  logout(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    const session = await api<{ user: AuthUser; profile: Profile }>('/auth/me');
    setUser(session.user);
    setProfile(session.profile);
  };

  useEffect(() => {
    const tokens = loadStoredTokens();
    if (!tokens.accessToken) {
      setLoading(false);
      return;
    }
    refreshMe().catch(() => clearTokens()).finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    loading,
    async login(email, password) {
      const session = await api<{ user: AuthUser; profile: Profile; accessToken: string; refreshToken: string }>('/auth/login', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email, password }),
      });
      setTokens(session);
      setUser(session.user);
      setProfile(session.profile);
    },
    async register(input) {
      await api<{ user: AuthUser; profile: Profile; accessToken: string; refreshToken: string }>('/auth/register', {
        method: 'POST',
        auth: false,
        body: JSON.stringify(input),
      });
      clearTokens();
      setUser(null);
      setProfile(null);
    },
    refreshMe,
    async logout() {
      try {
        await api('/auth/logout', { method: 'POST' });
      } finally {
        clearTokens();
        setUser(null);
        setProfile(null);
      }
    },
  }), [user, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
