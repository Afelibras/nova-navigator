import { useCallback, useEffect, useState } from "react";

export type FavoriteRoute = {
  id: string;
  originId: string;
  destinationId: string;
  label: string;
  createdAt: number;
};

const KEY = "atlas:favorites";

function read(): FavoriteRoute[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FavoriteRoute[]) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteRoute[]>([]);

  useEffect(() => {
    setFavorites(read());
  }, []);

  const persist = useCallback((next: FavoriteRoute[]) => {
    setFavorites(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const isFavorite = useCallback(
    (originId: string, destinationId: string) =>
      favorites.some((f) => f.originId === originId && f.destinationId === destinationId),
    [favorites],
  );

  const add = useCallback(
    (fav: Omit<FavoriteRoute, "id" | "createdAt">) => {
      if (favorites.some((f) => f.originId === fav.originId && f.destinationId === fav.destinationId)) {
        return;
      }
      const next: FavoriteRoute = {
        ...fav,
        id: `${fav.originId}->${fav.destinationId}`,
        createdAt: Date.now(),
      };
      persist([next, ...favorites].slice(0, 12));
    },
    [favorites, persist],
  );

  const remove = useCallback(
    (id: string) => persist(favorites.filter((f) => f.id !== id)),
    [favorites, persist],
  );

  const toggle = useCallback(
    (fav: Omit<FavoriteRoute, "id" | "createdAt">) => {
      const id = `${fav.originId}->${fav.destinationId}`;
      if (favorites.some((f) => f.id === id)) {
        remove(id);
      } else {
        add(fav);
      }
    },
    [favorites, add, remove],
  );

  return { favorites, isFavorite, add, remove, toggle };
}
