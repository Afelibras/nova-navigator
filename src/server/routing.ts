import { createServerFn } from "@tanstack/react-start";
import { getStore } from "./store";
import {
  planRoute,
  nearestElevator,
  poisOnFloor,
  buildRoute,
  routeLength,
} from "@/components/wayfinding/types";
import type { Poi } from "@/shared/types";

export const planRouteServer = createServerFn({ method: "POST" }).handler(async ({ data }: { data: { originId: string; destinationId: string } }) => {
  const store = getStore();
  const origin = store.getPoiById(data.originId);
  const destination = store.getPoiById(data.destinationId);

  if (!origin) throw new Error(`Origin POI not found: ${data.originId}`);
  if (!destination) throw new Error(`Destination POI not found: ${data.destinationId}`);

  const plan = planRoute(origin as Poi, destination as Poi);

  store.logEvent({
    type: "route_planned",
    userId: null,
    data: { originId: data.originId, destinationId: data.destinationId, distance: plan.distance, duration: plan.duration },
  });

  return plan;
});

export const getNearestElevator = createServerFn({ method: "GET" }).handler(async ({ data }: { data: string }) => {
  const store = getStore();
  const poi = store.getPoiById(data);
  if (!poi) throw new Error(`POI not found: ${data}`);
  const elev = nearestElevator(poi as Poi);
  return elev;
});

export const findNearestPoi = createServerFn({ method: "GET" }).handler(async ({ data }: { data: { poiId: string; excludeId?: string } }) => {
  const store = getStore();
  const poi = store.getPoiById(data.poiId);
  if (!poi) throw new Error(`POI not found: ${data.poiId}`);

  const nearest = poisOnFloor(poi.floor)
    .filter((x) => x.id !== poi.id && x.id !== data.excludeId && x.type === "room")
    .sort((a, b) => Math.hypot(a.x - poi.x, a.y - poi.y) - Math.hypot(b.x - poi.x, b.y - poi.y))[0];

  return nearest;
});

export const buildRouteServer = createServerFn({ method: "POST" }).handler(async ({ data }: { data: { fromId: string; toId: string } }) => {
  const store = getStore();
  const from = store.getPoiById(data.fromId);
  const to = store.getPoiById(data.toId);

  if (!from) throw new Error(`POI not found: ${data.fromId}`);
  if (!to) throw new Error(`POI not found: ${data.toId}`);

  const points = buildRoute(from as Poi, to as Poi);
  const distance = routeLength(points);

  return { points, distance, duration: distance / 1.3 };
});
