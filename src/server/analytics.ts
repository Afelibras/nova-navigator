import { createServerFn } from "@tanstack/react-start";
import { getStore } from "./store";

export const trackRouteRequest = createServerFn({ method: "POST" }).handler(async ({ data }: { data: { userId: string | null; originId: string; destinationId: string; distance: number; duration: number } }) => {
  const store = getStore();
  store.logEvent({
    type: "route_planned",
    userId: data.userId,
    data: {
      originId: data.originId,
      destinationId: data.destinationId,
      distance: data.distance,
      duration: data.duration,
    },
  });
  return { success: true };
});

export const getPopularRoutes = createServerFn({ method: "GET" }).handler(async ({ data }: { data: { limit?: number } }) => {
  const store = getStore();
  return store.getPopularRoutes(data.limit ?? 10);
});

export const getRecentRoutes = createServerFn({ method: "GET" }).handler(async ({ data }: { data: { limit?: number } }) => {
  const store = getStore();
  return store.getRoutePlans(data.limit ?? 50);
});

export const getStats = createServerFn({ method: "GET" }).handler(async () => {
  const store = getStore();
  return store.getStats();
});
