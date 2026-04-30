import { createServerFn } from "@tanstack/react-start";
import { getStore } from "./store";
import type { FavoriteRoute } from "@/shared/types";

export const getFavorites = createServerFn({ method: "GET" }).handler(async ({ data }: { data: { userId: string; token: string } }) => {
  const store = getStore();
  const session = store.getSession(data.token);
  if (!session) throw new Error("Unauthorized");
  if (session.userId !== data.userId) throw new Error("Unauthorized");

  return store.getUserFavorites(data.userId);
});

export const addFavorite = createServerFn({ method: "POST" }).handler(async ({ data }: { data: { userId: string; token: string; fav: Omit<FavoriteRoute, "id" | "createdAt"> } }) => {
  const store = getStore();
  const session = store.getSession(data.token);
  if (!session) throw new Error("Unauthorized");
  if (session.userId !== data.userId) throw new Error("Unauthorized");

  const favorite = store.addFavorite({
    ...data.fav,
    userId: data.userId,
  });

  store.logEvent({
    type: "favorite_added",
    userId: data.userId,
    data: { originId: data.fav.originId, destinationId: data.fav.destinationId, label: data.fav.label },
  });

  return favorite;
});

export const removeFavoriteServer = createServerFn({ method: "DELETE" }).handler(async ({ data }: { data: { id: string; userId: string; token: string } }) => {
  const store = getStore();
  const session = store.getSession(data.token);
  if (!session) throw new Error("Unauthorized");
  if (session.userId !== data.userId) throw new Error("Unauthorized");

  const favorite = store.getFavorite(data.id);
  if (!favorite || favorite.userId !== data.userId) throw new Error("Favorite not found");

  store.removeFavorite(data.id);

  store.logEvent({
    type: "favorite_removed",
    userId: data.userId,
    data: { favoriteId: data.id },
  });

  return { success: true };
});

export const isFavoriteServer = createServerFn({ method: "GET" }).handler(async ({ data }: { data: { userId: string; token: string; originId: string; destinationId: string } }) => {
  const store = getStore();
  const session = store.getSession(data.token);
  if (!session) throw new Error("Unauthorized");
  if (session.userId !== data.userId) throw new Error("Unauthorized");

  return store.isFavorite(data.userId, data.originId, data.destinationId);
});

export const toggleFavorite = createServerFn({ method: "POST" }).handler(async ({ data }: { data: { userId: string; token: string; originId: string; destinationId: string; label: string } }) => {
  const store = getStore();
  const session = store.getSession(data.token);
  if (!session) throw new Error("Unauthorized");
  if (session.userId !== data.userId) throw new Error("Unauthorized");

  const isFav = store.isFavorite(data.userId, data.originId, data.destinationId);

  if (isFav) {
    const id = `${data.originId}->${data.destinationId}`;
    store.removeFavorite(id);
    store.logEvent({
      type: "favorite_removed",
      userId: data.userId,
      data: { originId: data.originId, destinationId: data.destinationId },
    });
    return { action: "removed" as const, favorite: null };
  } else {
    const favorite = store.addFavorite({
      userId: data.userId,
      originId: data.originId,
      destinationId: data.destinationId,
      label: data.label,
    });
    store.logEvent({
      type: "favorite_added",
      userId: data.userId,
      data: { originId: data.originId, destinationId: data.destinationId, label: data.label },
    });
    return { action: "added" as const, favorite };
  }
});
