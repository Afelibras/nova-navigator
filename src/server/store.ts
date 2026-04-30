import {
  FLOORS,
  BUILDING,
  CORRIDORS_H,
  CORRIDORS_V,
} from "@/components/wayfinding/types";
import type {
  Poi,
  PoiType,
  FavoriteRoute,
  User,
  Session,
  AnalyticsEvent,
} from "@/shared/types";

type RoomTemplate = { suffix: string; x: number; y: number; w: number; h: number };

const TOP_ROW_LEFT: RoomTemplate[] = [
  { suffix: "00", x: 115, y: 110, w: 50, h: 36 },
  { suffix: "01", x: 170, y: 110, w: 50, h: 36 },
  { suffix: "02", x: 225, y: 110, w: 50, h: 36 },
  { suffix: "03", x: 280, y: 110, w: 50, h: 36 },
  { suffix: "04", x: 322, y: 110, w: 28, h: 36 },
  { suffix: "05", x: 352, y: 110, w: 28, h: 36 },
  { suffix: "06", x: 415, y: 110, w: 95, h: 36 },
];

const TOP_ROW_RIGHT: RoomTemplate[] = [
  { suffix: "07", x: 612, y: 110, w: 48, h: 36 },
  { suffix: "08", x: 662, y: 110, w: 38, h: 36 },
  { suffix: "09", x: 705, y: 110, w: 48, h: 36 },
  { suffix: "10", x: 760, y: 110, w: 48, h: 36 },
  { suffix: "17", x: 815, y: 110, w: 38, h: 36 },
];

const SECOND_ROW_LEFT: RoomTemplate[] = [
  { suffix: "00", x: 110, y: 200, w: 40, h: 70 },
  { suffix: "03", x: 195, y: 195, w: 50, h: 50 },
  { suffix: "04", x: 250, y: 195, w: 50, h: 50 },
  { suffix: "05", x: 305, y: 195, w: 50, h: 50 },
  { suffix: "06", x: 360, y: 195, w: 50, h: 50 },
  { suffix: "07", x: 440, y: 195, w: 110, h: 50 },
];

const SECOND_ROW_RIGHT: RoomTemplate[] = [
  { suffix: "11", x: 615, y: 195, w: 50, h: 50 },
  { suffix: "12", x: 670, y: 195, w: 50, h: 50 },
  { suffix: "14", x: 740, y: 195, w: 50, h: 50 },
  { suffix: "16", x: 815, y: 240, w: 38, h: 110 },
];

const MID_ROW: RoomTemplate[] = [
  { suffix: "00", x: 290, y: 415, w: 130, h: 56 },
  { suffix: "13", x: 700, y: 405, w: 110, h: 70 },
  { suffix: "17", x: 760, y: 470, w: 100, h: 60 },
  { suffix: "19", x: 820, y: 575, w: 50, h: 60 },
];

const FIFTH_ROW_LEFT: RoomTemplate[] = [
  { suffix: "00", x: 110, y: 460, w: 38, h: 70 },
  { suffix: "04", x: 110, y: 575, w: 30, h: 56 },
  { suffix: "05", x: 175, y: 575, w: 60, h: 38 },
  { suffix: "06", x: 240, y: 575, w: 50, h: 38 },
  { suffix: "07", x: 295, y: 575, w: 50, h: 38 },
  { suffix: "08", x: 350, y: 575, w: 50, h: 38 },
  { suffix: "10", x: 405, y: 575, w: 50, h: 38 },
  { suffix: "11", x: 460, y: 575, w: 50, h: 38 },
];

const FIFTH_ROW_RIGHT: RoomTemplate[] = [
  { suffix: "12", x: 615, y: 575, w: 30, h: 38 },
  { suffix: "16", x: 695, y: 575, w: 60, h: 38 },
  { suffix: "17", x: 760, y: 575, w: 50, h: 38 },
];

const SOUTH_ROW: RoomTemplate[] = [
  { suffix: "04", x: 380, y: 640, w: 60, h: 32 },
  { suffix: "05", x: 445, y: 640, w: 50, h: 32 },
  { suffix: "06", x: 500, y: 640, w: 50, h: 32 },
  { suffix: "07", x: 555, y: 640, w: 50, h: 32 },
];

function generateInitialPois(): Poi[] {
  const allPois: Poi[] = [];

  for (const floor of FLOORS) {
    const f = floor;
    const mk = (prefix: string) => (r: RoomTemplate): Poi => {
      const num = `${f}${prefix}${r.suffix}`;
      return {
        id: `r-${num}-f${f}`,
        name: `Sala ${num}`,
        short: num,
        type: "room" as PoiType,
        floor: f,
        x: r.x,
        y: r.y,
        w: r.w,
        h: r.h,
      };
    };

    const rooms: Poi[] = [
      ...TOP_ROW_LEFT.map(mk("1")),
      ...TOP_ROW_RIGHT.map(mk("1")),
      ...SECOND_ROW_LEFT.map(mk("2")),
      ...SECOND_ROW_RIGHT.map(mk("2")),
      ...MID_ROW.map(mk("4")),
      ...FIFTH_ROW_LEFT.map(mk("5")),
      ...FIFTH_ROW_RIGHT.map(mk("5")),
      ...SOUTH_ROW.map(mk("6")),
    ];

    allPois.push(...rooms);

    const infra: Poi[] = [
      { id: `elev-n-f${f}`, name: "Elevador Norte", type: "elevator", floor: f, x: 555, y: 200, w: 30, h: 60 },
      { id: `elev-s-f${f}`, name: "Elevador Sul", type: "elevator", floor: f, x: 555, y: 720 - 100, w: 30, h: 50 },
      { id: `elev-w-f${f}`, name: "Elevador Oeste", type: "elevator", floor: f, x: 95, y: 405, w: 24, h: 40 },
      { id: `stairs-e-f${f}`, name: "Escada Leste", type: "stairs", floor: f, x: 700, y: 470, w: 28, h: 40 },
      { id: `stairs-s-f${f}`, name: "Escada Sul — Emergência", type: "stairs", floor: f, x: 230, y: 700 - 60, w: 26, h: 36 },
      { id: `wc-male-n-f${f}`, name: "Banheiro Masculino — Norte", type: "restroom-male", floor: f, x: 525, y: 200, w: 22, h: 40 },
      { id: `wc-fem-c-f${f}`, name: "Banheiro Feminino — Central", type: "restroom-female", floor: f, x: 600, y: 470, w: 30, h: 40 },
      { id: `wc-fem-s-f${f}`, name: "Banheiro Feminino — Sul", type: "restroom-female", floor: f, x: 660, y: 575, w: 28, h: 38 },
      { id: `wc-male-w-f${f}`, name: "Banheiro Masculino — Oeste", type: "restroom-male", floor: f, x: 113, y: 380, w: 18, h: 24 },
    ];

    allPois.push(...infra);

    if (f === 1) {
      allPois.push(
        { id: `entrance-f1`, name: "Entrada Principal", type: "entrance", floor: 1, x: 95, y: 660, w: 24, h: 30 },
        { id: `exit-e-f1`, name: "Saída Leste", type: "exit", floor: 1, x: 870, y: 470, w: 24, h: 30 },
        { id: `exit-s-f1`, name: "Saída Sul", type: "exit", floor: 1, x: 555, y: 685, w: 28, h: 14 },
        { id: `cafe-f1`, name: "Café & Lounge", type: "cafe", floor: 1, x: 415, y: 470, w: 60, h: 60 },
      );
    }
  }

  return allPois;
}

export class MemoryStore {
  private pois: Map<string, Poi> = new Map();
  private users: Map<string, User> = new Map();
  private sessions: Map<string, Session> = new Map();
  private favorites: Map<string, FavoriteRoute> = new Map();
  private analytics: AnalyticsEvent[] = [];
  private nextId = 1;

  constructor() {
    const initialPois = generateInitialPois();
    for (const poi of initialPois) {
      this.pois.set(poi.id, poi);
    }

    const adminHash = simpleHash("admin123");
    this.users.set("admin-1", {
      id: "admin-1",
      email: "admin@localiza.com",
      name: "Administrador",
      passwordHash: adminHash,
      createdAt: Date.now(),
      role: "admin",
    });
  }

  private genId(): string {
    return `id-${this.nextId++}-${Date.now()}`;
  }

  // POI operations
  getAllPois(): Poi[] {
    return Array.from(this.pois.values());
  }

  getPoiById(id: string): Poi | undefined {
    return this.pois.get(id);
  }

  getPoisByFloor(floor: number): Poi[] {
    return Array.from(this.pois.values()).filter((p) => p.floor === floor);
  }

  getPoisByType(type: PoiType): Poi[] {
    return Array.from(this.pois.values()).filter((p) => p.type === type);
  }

  getPoisByFloorAndType(floor: number, type: PoiType): Poi[] {
    return Array.from(this.pois.values()).filter(
      (p) => p.floor === floor && p.type === type,
    );
  }

  searchPois(query: string): Poi[] {
    const q = query.toLowerCase();
    return Array.from(this.pois.values()).filter(
      (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || (p.short && p.short.toLowerCase().includes(q)),
    );
  }

  createPoi(poi: Omit<Poi, "id">): Poi {
    const newPoi: Poi = { ...poi, id: `custom-${this.genId()}` };
    this.pois.set(newPoi.id, newPoi);
    return newPoi;
  }

  updatePoi(id: string, updates: Partial<Poi>): Poi | undefined {
    const existing = this.pois.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.pois.set(id, updated);
    return updated;
  }

  deletePoi(id: string): boolean {
    return this.pois.delete(id);
  }

  getBuilding() {
    return BUILDING;
  }

  getFloors() {
    return FLOORS;
  }

  // Routing helpers
  getCorridorsH(): number[] {
    return CORRIDORS_H;
  }

  getCorridorsV(): number[] {
    return CORRIDORS_V;
  }

  // User operations
  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  createUser(email: string, password: string, name: string): User {
    const user: User = {
      id: this.genId(),
      email,
      name,
      passwordHash: simpleHash(password),
      createdAt: Date.now(),
      role: "user",
    };
    this.users.set(user.id, user);
    return user;
  }

  verifyPassword(user: User, password: string): boolean {
    return user.passwordHash === simpleHash(password);
  }

  // Session operations
  createSession(userId: string): Session {
    const session: Session = {
      token: `${this.genId()}-${Math.random().toString(36).slice(2)}`,
      userId,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
    this.sessions.set(session.token, session);
    return session;
  }

  getSession(token: string): Session | undefined {
    const session = this.sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      if (session) this.sessions.delete(token);
      return undefined;
    }
    return session;
  }

  deleteSession(token: string): boolean {
    return this.sessions.delete(token);
  }

  // Favorite operations
  getUserFavorites(userId: string): FavoriteRoute[] {
    return Array.from(this.favorites.values())
      .filter((f) => f.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  getFavorite(id: string): FavoriteRoute | undefined {
    return this.favorites.get(id);
  }

  addFavorite(fav: Omit<FavoriteRoute, "id" | "createdAt">): FavoriteRoute {
    const id = `${fav.originId}->${fav.destinationId}`;
    const existing = this.favorites.get(id);
    if (existing) return existing;

    const newFav: FavoriteRoute = {
      ...fav,
      id,
      createdAt: Date.now(),
    };
    this.favorites.set(id, newFav);
    return newFav;
  }

  removeFavorite(id: string): boolean {
    return this.favorites.delete(id);
  }

  isFavorite(userId: string, originId: string, destinationId: string): boolean {
    return Array.from(this.favorites.values()).some(
      (f) => f.userId === userId && f.originId === originId && f.destinationId === destinationId,
    );
  }

  // Analytics operations
  logEvent(event: Omit<AnalyticsEvent, "id" | "timestamp">): void {
    this.analytics.push({
      ...event,
      id: this.genId(),
      timestamp: Date.now(),
    });
  }

  getRoutePlans(limit = 50): AnalyticsEvent[] {
    return this.analytics
      .filter((e) => e.type === "route_planned")
      .slice(-limit)
      .reverse();
  }

  getPopularRoutes(limit = 10): { route: string; count: number }[] {
    const routeCounts = new Map<string, number>();
    for (const event of this.analytics) {
      if (event.type === "route_planned" && event.data.originId && event.data.destinationId) {
        const key = `${event.data.originId}->${event.data.destinationId}`;
        routeCounts.set(key, (routeCounts.get(key) || 0) + 1);
      }
    }
    return Array.from(routeCounts.entries())
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getStats() {
    return {
      totalPois: this.pois.size,
      totalUsers: this.users.size,
      totalFavorites: this.favorites.size,
      totalRouteRequests: this.analytics.filter((e) => e.type === "route_planned").length,
    };
  }
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `h-${Math.abs(hash).toString(36)}`;
}

let storeInstance: MemoryStore | null = null;

export function getStore(): MemoryStore {
  if (!storeInstance) {
    storeInstance = new MemoryStore();
  }
  return storeInstance;
}
