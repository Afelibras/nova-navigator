import { z } from "zod";

export const poiTypeSchema = z.enum([
  "elevator",
  "stairs",
  "room",
  "entrance",
  "exit",
  "restroom",
  "restroom-female",
  "restroom-male",
  "cafe",
]);

export type PoiType = z.infer<typeof poiTypeSchema>;

export const poiSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: poiTypeSchema,
  floor: z.number().int().min(1).max(6),
  x: z.number(),
  y: z.number(),
  w: z.number().optional(),
  h: z.number().optional(),
  short: z.string().optional(),
});

export type Poi = z.infer<typeof poiSchema>;

export const routeSegmentSchema = z.object({
  floor: z.number(),
  points: z.array(z.object({ x: z.number(), y: z.number() })),
  from: poiSchema,
  to: poiSchema,
});

export const routePlanSchema = z.object({
  segments: z.array(routeSegmentSchema),
  distance: z.number(),
  duration: z.number(),
  floorChange: z.boolean(),
});

export type RoutePlan = z.infer<typeof routePlanSchema>;

export const favoriteRouteSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  originId: z.string(),
  destinationId: z.string(),
  label: z.string(),
  createdAt: z.number(),
});

export type FavoriteRoute = z.infer<typeof favoriteRouteSchema>;

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  passwordHash: z.string(),
  createdAt: z.number(),
  role: z.enum(["user", "admin"]).default("user"),
});

export type User = z.infer<typeof userSchema>;

export const sessionSchema = z.object({
  token: z.string(),
  userId: z.string(),
  expiresAt: z.number(),
});

export type Session = z.infer<typeof sessionSchema>;

export const analyticsEventSchema = z.object({
  id: z.string(),
  type: z.enum(["route_planned", "favorite_added", "favorite_removed", "login", "logout"]),
  userId: z.string().nullable(),
  data: z.record(z.unknown()),
  timestamp: z.number(),
});

export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const registerInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

export const createPoiInputSchema = z.object({
  name: z.string().min(1),
  type: poiTypeSchema,
  floor: z.number().int().min(1).max(6),
  x: z.number(),
  y: z.number(),
  w: z.number().optional(),
  h: z.number().optional(),
  short: z.string().optional(),
});

export type CreatePoiInput = z.infer<typeof createPoiInputSchema>;

export const updatePoiInputSchema = createPoiInputSchema.partial();

export type UpdatePoiInput = z.infer<typeof updatePoiInputSchema>;

export const planRouteInputSchema = z.object({
  originId: z.string(),
  destinationId: z.string(),
});

export type PlanRouteInput = z.infer<typeof planRouteInputSchema>;
