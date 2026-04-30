import { useCallback, useEffect, useState } from "react";
import {
  getFavorites,
  addFavorite,
  removeFavoriteServer,
  isFavoriteServer,
  toggleFavorite,
} from "@/server/favorites";

export type FavoriteRoute = {
  id: string;
  userId: string | null;
  originId: string;
  destinationId: string;
  label: string;
  createdAt: number;
};

const LOCAL_KEY = "atlas:favorites";

function readLocal(): Omit<FavoriteRoute, "userId">[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Omit<FavoriteRoute, "userId">[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(favs: Omit<FavoriteRoute, "userId">[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(favs));
  } catch {
    // ignore
  }
}

export function useFavorites(userId: string | null, token: string | null) {
  const [favorites, setFavorites] = useState<FavoriteRoute[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId && token) {
      setLoading(true);
      getFavorites({ data: { userId, token } })
        .then((favs) => setFavorites(favs))
        .catch(() => {
          const local = readLocal();
          setFavorites(local.map((f) => ({ ...f, userId: null })));
        })
        .finally(() => setLoading(false));
    } else {
      const local = readLocal();
      setFavorites(local.map((f) => ({ ...f, userId: null })));
    }
  }, [userId, token]);

  const persistLocal = useCallback((favs: Omit<FavoriteRoute, "userId">[]) => {
    writeLocal(favs);
    setFavorites(favs.map((f) => ({ ...f, userId: null })));
  }, []);

  const isFavorite = useCallback(
    async (originId: string, destinationId: string): Promise<boolean> => {
      if (userId && token) {
        return isFavoriteServer({ data: { userId, token, originId, destinationId } });
      }
      return favorites.some(
        (f) => f.originId === originId && f.destinationId === destinationId,
      );
    },
    [favorites, userId, token],
  );

  const add = useCallback(
    async (fav: { originId: string; destinationId: string; label: string }) => {
      if (userId && token) {
        const result = await addFavorite({
          data: {
            userId,
            token,
            fav: { ...fav, userId },
          },
        });
        setFavorites((prev) => [result, ...prev].slice(0, 12));
        return result;
      }

      const local = readLocal();
      if (local.some((f) => f.originId === fav.originId && f.destinationId === fav.destinationId)) {
        return;
      }
      const newFav: Omit<FavoriteRoute, "userId"> = {
        ...fav,
        id: `${fav.originId}->${fav.destinationId}`,
        createdAt: Date.now(),
      };
      const next = [newFav, ...local].slice(0, 12);
      persistLocal(next);
      return newFav;
    },
    [userId, token, persistLocal],
  );

  const remove = useCallback(
    async (id: string) => {
      if (userId && token) {
        await removeFavoriteServer({ data: { id, userId, token } });
        setFavorites((prev) => prev.filter((f) => f.id !== id));
        return;
      }

      const local = readLocal();
      persistLocal(local.filter((f) => f.id !== id));
    },
    [userId, token, persistLocal],
  );

  const toggle = useCallback(
    async (fav: { originId: string; destinationId: string; label: string }) => {
      if (userId && token) {
        const result = await toggleFavorite({
          data: { userId, token, ...fav },
        });
        if (result.action === "added") {
          setFavorites((prev) => [result.favorite!, ...prev].slice(0, 12));
        } else {
          setFavorites((prev) => prev.filter((f) => f.id !== `${fav.originId}->${fav.destinationId}`));
        }
        return result;
      }

      const local = readLocal();
      const id = `${fav.originId}->${fav.destinationId}`;
      if (local.some((f) => f.id === id)) {
        persistLocal(local.filter((f) => f.id !== id));
        return { action: "removed" as const, favorite: null };
      } else {
        const newFav: Omit<FavoriteRoute, "userId"> = {
          ...fav,
          id,
          createdAt: Date.now(),
        };
        const next = [newFav, ...local].slice(0, 12);
        persistLocal(next);
        return { action: "added" as const, favorite: newFav };
      }
    },
    [userId, token, persistLocal],
  );

  return { favorites, isFavorite, add, remove, toggle, loading };
}
