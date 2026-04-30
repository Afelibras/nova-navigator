import { createServerFn } from "@tanstack/react-start";
import { getStore } from "./store";

export const loginServer = createServerFn({ method: "POST" }).handler(async ({ data }: { data: { email: string; password: string } }) => {
  const store = getStore();
  const user = store.getUserByEmail(data.email);

  if (!user) throw new Error("Invalid email or password");
  if (!store.verifyPassword(user, data.password)) throw new Error("Invalid email or password");

  const session = store.createSession(user.id);

  store.logEvent({
    type: "login",
    userId: user.id,
    data: { email: user.email },
  });

  return {
    token: session.token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    },
  };
});

export const registerServer = createServerFn({ method: "POST" }).handler(async ({ data }: { data: { email: string; password: string; name: string } }) => {
  const store = getStore();
  const existing = store.getUserByEmail(data.email);
  if (existing) throw new Error("Email already registered");

  const user = store.createUser(data.email, data.password, data.name);
  const session = store.createSession(user.id);

  store.logEvent({
    type: "login",
    userId: user.id,
    data: { email: user.email, registered: true },
  });

  return {
    token: session.token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    },
  };
});

export const logoutServer = createServerFn({ method: "POST" }).handler(async ({ data }: { data: string }) => {
  const store = getStore();
  const session = store.getSession(data);
  if (session) {
    store.logEvent({
      type: "logout",
      userId: session.userId,
      data: {},
    });
    store.deleteSession(data);
  }
  return { success: true };
});

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async ({ data }: { data: string }) => {
  const store = getStore();
  const session = store.getSession(data);
  if (!session) return null;

  const user = store.getUserById(session.userId);
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
});

export const validateToken = createServerFn({ method: "GET" }).handler(async ({ data }: { data: string }) => {
  const store = getStore();
  const session = store.getSession(data);
  if (!session) return { valid: false };

  const user = store.getUserById(session.userId);
  return {
    valid: true,
    userId: session.userId,
    expiresAt: session.expiresAt,
    role: user?.role ?? "user",
  };
});
