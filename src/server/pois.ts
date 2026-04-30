import { createServerFn } from "@tanstack/react-start";
import { getStore } from "./store";
import type { Poi, PoiType } from "@/shared/types";

export const getAllPois = createServerFn({ method: "GET" }).handler(async () => {
  const store = getStore();
  return store.getAllPois();
});

export const getPoiById = createServerFn({ method: "GET" }).handler(async ({ data }: { data: string }) => {
  const store = getStore();
  const poi = store.getPoiById(data);
  if (!poi) throw new Error(`POI not found: ${data}`);
  return poi;
});

export const getPoisByFloor = createServerFn({ method: "GET" }).handler(async ({ data }: { data: number }) => {
  const store = getStore();
  return store.getPoisByFloor(data);
});

export const getPoisByType = createServerFn({ method: "GET" }).handler(async ({ data }: { data: PoiType }) => {
  const store = getStore();
  return store.getPoisByType(data);
});

export const getPoisByFloorAndType = createServerFn({ method: "GET" }).handler(async ({ data }: { data: { floor: number; type: PoiType } }) => {
  const store = getStore();
  return store.getPoisByFloorAndType(data.floor, data.type);
});

export const searchPois = createServerFn({ method: "GET" }).handler(async ({ data }: { data: string }) => {
  const store = getStore();
  return store.searchPois(data);
});

export const getBuilding = createServerFn({ method: "GET" }).handler(async () => {
  const store = getStore();
  return store.getBuilding();
});

export const getFloors = createServerFn({ method: "GET" }).handler(async () => {
  const store = getStore();
  return store.getFloors();
});

export const createPoiServer = createServerFn({ method: "POST" }).handler(async ({ data }: { data: { poi: Omit<Poi, "id">; adminToken: string } }) => {
  const store = getStore();
  const session = store.getSession(data.adminToken);
  if (!session) throw new Error("Unauthorized");
  const user = store.getUserById(session.userId);
  if (!user || user.role !== "admin") throw new Error("Admin access required");
  return store.createPoi(data.poi);
});

export const updatePoiServer = createServerFn({ method: "PATCH" }).handler(async ({ data }: { data: { id: string; updates: Partial<Poi>; adminToken: string } }) => {
  const store = getStore();
  const session = store.getSession(data.adminToken);
  if (!session) throw new Error("Unauthorized");
  const user = store.getUserById(session.userId);
  if (!user || user.role !== "admin") throw new Error("Admin access required");
  const updated = store.updatePoi(data.id, data.updates);
  if (!updated) throw new Error(`POI not found: ${data.id}`);
  return updated;
});

export const deletePoiServer = createServerFn({ method: "DELETE" }).handler(async ({ data }: { data: { id: string; adminToken: string } }) => {
  const store = getStore();
  const session = store.getSession(data.adminToken);
  if (!session) throw new Error("Unauthorized");
  const user = store.getUserById(session.userId);
  if (!user || user.role !== "admin") throw new Error("Admin access required");
  const success = store.deletePoi(data.id);
  if (!success) throw new Error(`POI not found: ${data.id}`);
  return { success: true };
});
