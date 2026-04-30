export type PoiType =
  | "elevator"
  | "stairs"
  | "room"
  | "entrance"
  | "exit"
  | "restroom"
  | "restroom-female"
  | "restroom-male"
  | "cafe"
  | "water";

export type Poi = {
  id: string;
  name: string;
  type: PoiType;
  /** Floor number 1..6 */
  floor: number;
  /** Center coords on the canvas (0-1000 x 0-1000) */
  x: number;
  y: number;
  /** Optional rect dimensions for room blocks */
  w?: number;
  h?: number;
  /** Short label drawn on the block */
  short?: string;
};

export const FLOORS = [1, 2, 3, 4, 5, 6] as const;
export type Floor = (typeof FLOORS)[number];

// --- Geometry helpers shared by all floors ---
export const BUILDING = {
  main: { x: 0, y: 0, w: 1000, h: 1000 },
};

type RoomTemplate = { suffix: string; x: number; y: number; w: number; h: number };

// Fileira Superior (1100 a 1110) — Alinhadas no topo. Y ~ 100.
const TOP_ROW_LEFT: RoomTemplate[] = [
  { suffix: "00", x: 180, y: 100, w: 50, h: 36 },
  { suffix: "01", x: 240, y: 100, w: 50, h: 36 },
  { suffix: "02", x: 300, y: 100, w: 50, h: 36 },
  { suffix: "03", x: 360, y: 100, w: 50, h: 36 },
  { suffix: "04", x: 420, y: 100, w: 50, h: 36 },
  { suffix: "05", x: 480, y: 100, w: 50, h: 36 },
];

const TOP_ROW_RIGHT: RoomTemplate[] = [
  { suffix: "07", x: 650, y: 100, w: 48, h: 36 },
  { suffix: "08", x: 710, y: 100, w: 48, h: 36 },
  { suffix: "09", x: 770, y: 100, w: 48, h: 36 },
  { suffix: "10", x: 830, y: 100, w: 48, h: 36 },
];

// Bloco Centro-Esq Superior (1203 a 1207) — X=150 a 530, Y=250.
const MID_ROW_TOP: RoomTemplate[] = [
  { suffix: "03", x: 200, y: 250, w: 60, h: 50 },
  { suffix: "04", x: 270, y: 250, w: 60, h: 50 },
  { suffix: "05", x: 340, y: 250, w: 60, h: 50 },
  { suffix: "06", x: 410, y: 250, w: 60, h: 50 },
  { suffix: "07", x: 480, y: 250, w: 50, h: 50 },
];

// Bloco Centro-Esq Inferior (1400) — X=150 a 400, Y=600.
const MID_ROW_BOTTOM_LEFT: RoomTemplate[] = [
  { suffix: "00", x: 220, y: 600, w: 80, h: 56 },
  { suffix: "04", x: 320, y: 600, w: 60, h: 56 },
];

// Bloco Centro-Drt Inferior (1413, 1417) — X=640 a 870, Y=525.
const MID_ROW_BOTTOM_RIGHT: RoomTemplate[] = [
  { suffix: "13", x: 750, y: 525, w: 80, h: 70 },
  { suffix: "17", x: 850, y: 525, w: 40, h: 70 },
];

// Fileiras Inferiores (1504-1511) — Y=750.
const LOW_ROW_LEFT: RoomTemplate[] = [
  { suffix: "04", x: 200, y: 750, w: 50, h: 40 },
  { suffix: "05", x: 270, y: 750, w: 50, h: 40 },
  { suffix: "06", x: 340, y: 750, w: 50, h: 40 },
  { suffix: "07", x: 410, y: 750, w: 50, h: 40 },
  { suffix: "08", x: 480, y: 750, w: 50, h: 40 },
];

// Fileira Fundo (1605-1608) — Y=900.
const BOTTOM_ROW: RoomTemplate[] = [
  { suffix: "05", x: 250, y: 900, w: 60, h: 40 },
  { suffix: "06", x: 340, y: 900, w: 60, h: 40 },
  { suffix: "07", x: 430, y: 900, w: 60, h: 40 },
  { suffix: "08", x: 520, y: 900, w: 60, h: 40 },
];

// Bloco Esquerdo (1200, 1500) — X=50.
const LEFT_BLOCK: RoomTemplate[] = [
  { suffix: "00", x: 50, y: 210, w: 40, h: 70 },
  { suffix: "00", x: 50, y: 620, w: 40, h: 60 },
];

function makeFloor(floor: number): Poi[] {
  const f = floor;
  const mk = (prefix: string) => (r: RoomTemplate): Poi => {
    const num = `${f}${prefix}${r.suffix}`;
    return {
      id: `r-${num}-f${f}`,
      name: `Sala ${num}`,
      short: num,
      type: "room",
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
    ...MID_ROW_TOP.map(mk("2")),
    ...MID_ROW_BOTTOM_LEFT.map(mk("4")),
    ...MID_ROW_BOTTOM_RIGHT.map(mk("4")),
    ...LOW_ROW_LEFT.map(mk("5")),
    ...BOTTOM_ROW.map(mk("6")),
    ...LEFT_BLOCK.map((r, i) => {
       const num = i === 0 ? `${f}200` : `${f}500`;
       return {
         id: `r-${num}-f${f}`,
         name: `Sala ${num}`,
         short: num.slice(1),
         type: "room",
         floor: f,
         x: r.x,
         y: r.y,
         w: r.w,
         h: r.h,
       };
    }),
  ];

  const infra: Poi[] = [
    { id: `elev-w-f${f}`, name: "Elevador Oeste", type: "elevator", floor: f, x: 80, y: 550, w: 30, h: 50 },
    { id: `elev-c-f${f}`, name: "Elevador Central", type: "elevator", floor: f, x: 570, y: 550, w: 30, h: 50 },

    { id: `stairs-1-f${f}`, name: "Escada NE", type: "stairs", floor: f, x: 620, y: 120, w: 28, h: 40 },
    { id: `stairs-2-f${f}`, name: "Escada O", type: "stairs", floor: f, x: 80, y: 210, w: 26, h: 36 },
    { id: `stairs-3-f${f}`, name: "Escada Centro", type: "stairs", floor: f, x: 620, y: 430, w: 28, h: 40 },
    { id: `stairs-4-f${f}`, name: "Escada S", type: "stairs", floor: f, x: 620, y: 880, w: 26, h: 36 },

    { id: `wc-male-n-f${f}`, name: "Banheiro Masculino N", type: "restroom-male", floor: f, x: 700, y: 250, w: 40, h: 40 },
    { id: `wc-male-s-l-f${f}`, name: "Banheiro Masc S-O", type: "restroom-male", floor: f, x: 200, y: 880, w: 30, h: 30 },
    { id: `wc-male-s-r-f${f}`, name: "Banheiro Masc S-L", type: "restroom-male", floor: f, x: 780, y: 880, w: 30, h: 30 },
    { id: `wc-fem-s-f${f}`, name: "Banheiro Feminino", type: "restroom-female", floor: f, x: 700, y: 780, w: 40, h: 40 },

    { id: `water-f${f}`, name: "Bebedouro", type: "cafe", floor: f, x: 620, y: 800, w: 24, h: 24 },
  ];

  if (f === 1) {
    infra.push(
      { id: `entrance-f1`, name: "Entrada Principal", type: "entrance", floor: 1, x: 550, y: 50, w: 40, h: 20 },
      { id: `exit-s-f1`, name: "Saída Sul", type: "exit", floor: 1, x: 400, y: 960, w: 40, h: 20 },
    );
  }

  return rooms.concat(infra);
}

export const POIS_BY_FLOOR: Record<number, Poi[]> = Object.fromEntries(
  FLOORS.map((f) => [f, makeFloor(f)]),
);

export const ALL_POIS: Poi[] = FLOORS.flatMap((f) => POIS_BY_FLOOR[f]);

export const POIS = ALL_POIS;

export function findPoi(id: string): Poi {
  return ALL_POIS.find((p) => p.id === id)!;
}

export function poisOnFloor(floor: number): Poi[] {
  return POIS_BY_FLOOR[floor] ?? [];
}

export function nearestElevator(p: Poi): Poi {
  const sameFloor = poisOnFloor(p.floor).filter((q) => q.type === "elevator");
  return sameFloor
    .slice()
    .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
}

// --- A* Pathfinding on corridor grid ---
const CELL = 10;
const CANVAS_W = 1000;
const CANVAS_H = 1000;
const COLS = CANVAS_W / CELL;
const ROWS = CANVAS_H / CELL;

function buildObstacleGrid(pois: Poi[]): Uint8Array {
  const grid = new Uint8Array(COLS * ROWS);
  
  // Mark room cells as blocked (with padding for walls)
  for (const p of pois) {
    if (p.type !== "room") continue;
    const halfW = (p.w ?? 22) / 2 + 3;
    const halfH = (p.h ?? 22) / 2 + 3;
    const x1 = Math.floor((p.x - halfW) / CELL);
    const y1 = Math.floor((p.y - halfH) / CELL);
    const x2 = Math.ceil((p.x + halfW) / CELL);
    const y2 = Math.ceil((p.y + halfH) / CELL);
    for (let r = y1; r <= y2; r++) {
      for (let c = x1; c <= x2; c++) {
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
          grid[r * COLS + c] = 1;
        }
      }
    }
  }
  return grid;
}

let obstacleGridCache: Map<number, Uint8Array> = new Map();

function getObstacleGrid(floor: number): Uint8Array {
  if (!obstacleGridCache.has(floor)) {
    obstacleGridCache.set(floor, buildObstacleGrid(poisOnFloor(floor)));
  }
  return obstacleGridCache.get(floor)!;
}

interface AStarNode {
  r: number;
  c: number;
  g: number;
  f: number;
}

function astar(
  grid: Uint8Array,
  sr: number,
  sc: number,
  er: number,
  ec: number,
): { r: number; c: number }[] | null {
  sr = Math.max(0, Math.min(ROWS - 1, sr));
  sc = Math.max(0, Math.min(COLS - 1, sc));
  er = Math.max(0, Math.min(ROWS - 1, er));
  ec = Math.max(0, Math.min(COLS - 1, ec));

  if (grid[er * COLS + ec] === 1) return null;
  if (sr === er && sc === ec) return [{ r: sr, c: sc }];

  const cameFrom = new Map<number, number>();
  const gScore = new Map<number, number>();
  const startKey = sr * COLS + sc;
  gScore.set(startKey, 0);

  const openSet: AStarNode[] = [{ r: sr, c: sc, g: 0, f: Math.abs(sr - er) + Math.abs(sc - ec) }];

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    const ck = current.r * COLS + current.c;

    if (current.r === er && current.c === ec) {
      const path: { r: number; c: number }[] = [];
      let key = ck;
      while (cameFrom.has(key)) {
        const prev = cameFrom.get(key)!;
        path.unshift({ r: Math.floor(prev / COLS), c: prev % COLS });
        key = prev;
      }
      return path;
    }

    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    for (const [dr, dc] of dirs) {
      const nr = current.r + dr;
      const nc = current.c + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      const nk = nr * COLS + nc;
      if (grid[nk] === 1) continue;
      const tentativeG = current.g + 1;
      if (!gScore.has(nk) || tentativeG < gScore.get(nk)!) {
        cameFrom.set(nk, ck);
        gScore.set(nk, tentativeG);
        const f = tentativeG + Math.abs(nr - er) + Math.abs(nc - ec);
        openSet.push({ r: nr, c: nc, g: tentativeG, f });
      }
    }
  }
  return null;
}

function gridToPoints(path: { r: number; c: number }[]): { x: number; y: number }[] {
  return path.map(p => ({ x: p.c * CELL + CELL / 2, y: p.r * CELL + CELL / 2 }));
}

export function buildRoute(a: Poi, b: Poi): { x: number; y: number }[] {
  const grid = getObstacleGrid(a.floor);
  const sr = Math.round(a.y / CELL);
  const sc = Math.round(a.x / CELL);
  const er = Math.round(b.y / CELL);
  const ec = Math.round(b.x / CELL);

  const path = astar(grid, sr, sc, er, ec);
  if (path) return gridToPoints(path);

  return [{ x: a.x, y: a.y }, { x: b.x, y: b.y }];
}

export function routeLength(points: { x: number; y: number }[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return len * 0.12;
}

export type RoutePlan = {
  segments: {
    floor: number;
    points: { x: number; y: number }[];
    from: Poi;
    to: Poi;
  }[];
  distance: number;
  duration: number;
  floorChange: boolean;
};

export function planRoute(origin: Poi, destination: Poi): RoutePlan {
  if (origin.floor === destination.floor) {
    const pts = buildRoute(origin, destination);
    const d = routeLength(pts);
    return {
      segments: [{ floor: origin.floor, points: pts, from: origin, to: destination }],
      distance: d,
      duration: d / 1.3,
      floorChange: false,
    };
  }

  const elevA = nearestElevator(origin);
  const shaft = elevA.id.replace(/-f\d+$/, "");
  const elevB =
    poisOnFloor(destination.floor).find((p) => p.id.startsWith(shaft)) ??
    nearestElevator(destination);

  const seg1 = buildRoute(origin, elevA);
  const seg2 = buildRoute(elevB, destination);
  const d1 = routeLength(seg1);
  const d2 = routeLength(seg2);
  const elevatorWait = 25;
  const verticalSeconds = Math.abs(origin.floor - destination.floor) * 8;

  return {
    segments: [
      { floor: origin.floor, points: seg1, from: origin, to: elevA },
      { floor: destination.floor, points: seg2, from: elevB, to: destination },
    ],
    distance: d1 + d2,
    duration: d1 / 1.3 + d2 / 1.3 + elevatorWait + verticalSeconds,
    floorChange: true,
  };
}

export function nearestPoi(p: Poi, exclude?: string): Poi {
  return poisOnFloor(p.floor)
    .filter((x) => x.id !== p.id && x.id !== exclude && x.type === "room")
    .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
}
