import { useCallback, useEffect, useState } from "react";
import { loginServer, registerServer, logoutServer, getCurrentUser } from "@/server/auth";

type User = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt: number;
};

const TOKEN_KEY = "atlas:token";
const USER_KEY = "atlas:user";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore
  }
}

function getUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function setUser(user: User | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(USER_KEY);
    }
  } catch {
    // ignore
  }
}

export function useAuth() {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = getToken();
    const savedUser = getUser();
    if (savedToken && savedUser) {
      setTokenState(savedToken);
      setUserState(savedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginServer({ data: { email, password } });
    setToken(result.token);
    setUserState(result.user);
    return result;
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const result = await registerServer({ data: { email, password, name } });
    setToken(result.token);
    setUserState(result.user);
    return result;
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await logoutServer({ data: token });
      } catch {
        // ignore
      }
    }
    setToken(null);
    setUserState(null);
  }, [token]);

  return { user, token, loading, login, register, logout, isAuthenticated: !!token };
}
