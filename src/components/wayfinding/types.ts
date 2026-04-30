export type PoiType =
  | "elevator"
  | "stairs"
  | "room"
  | "entrance"
  | "exit"
  | "restroom"
  | "restroom-female"
  | "restroom-male"
  | "cafe";

export type Poi = {
  id: string;
  name: string;
  type: PoiType;
  /** Floor number 1..6 */
  floor: number;
  /** Center coords on the canvas (0-1000 x 0-700) */
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
  main: { x: 80, y: 70, w: 760, h: 580 },
  annexTop: { x: 840, y: 90, w: 110, h: 230 },
  annexBottom: { x: 840, y: 360, w: 110, h: 240 },
  greenTop: { x: 870, y: 110, w: 70, h: 200 },
  greenBottom: { x: 870, y: 380, w: 70, h: 200 },
  innerGreens: [
    { x: 290, y: 240, w: 270, h: 90 },
    { x: 600, y: 240, w: 220, h: 90 },
    { x: 290, y: 470, w: 280, h: 70 },
    { x: 600, y: 470, w: 220, h: 70 },
  ],
  corridorsH: [
    { x: 80, y: 350, w: 760, h: 38 },
    { x: 80, y: 595, w: 760, h: 28 },
  ],
  corridorsV: [
    { x: 555, y: 70, w: 38, h: 580 },
  ],
};

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
    ...SECOND_ROW_LEFT.map(mk("2")),
    ...SECOND_ROW_RIGHT.map(mk("2")),
    ...MID_ROW.map(mk("4")),
    ...FIFTH_ROW_LEFT.map(mk("5")),
    ...FIFTH_ROW_RIGHT.map(mk("5")),
    ...SOUTH_ROW.map(mk("6")),
  ];

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

  if (f === 1) {
    infra.push(
      { id: `entrance-f1`, name: "Entrada Principal", type: "entrance", floor: 1, x: 95, y: 660, w: 24, h: 30 },
      { id: `exit-e-f1`, name: "Saída Leste", type: "exit", floor: 1, x: 870, y: 470, w: 24, h: 30 },
      { id: `exit-s-f1`, name: "Saída Sul", type: "exit", floor: 1, x: 555, y: 685, w: 28, h: 14 },
      { id: `cafe-f1`, name: "Café & Lounge", type: "cafe", floor: 1, x: 415, y: 470, w: 60, h: 60 },
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
// Grid cell size: each cell represents 10 canvas units
const CELL = 10;
const CANVAS_W = 1000;
const CANVAS_H = 720;
const COLS = CANVAS_W / CELL;
const ROWS = CANVAS_H / CELL;

function buildObstacleGrid(pois: Poi[]): Uint8Array {
  const grid = new Uint8Array(COLS * ROWS);
  // Mark all cells outside building as blocked
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const px = c * CELL + CELL / 2;
      const py = r * CELL + CELL / 2;
      const inMain = px >= BUILDING.main.x && px <= BUILDING.main.x + BUILDING.main.w &&
                     py >= BUILDING.main.y && py <= BUILDING.main.y + BUILDING.main.h;
      const inAnnex = (px >= BUILDING.annexTop.x && px <= BUILDING.annexTop.x + BUILDING.annexTop.w &&
                       py >= BUILDING.annexTop.y && py <= BUILDING.annexTop.y + BUILDING.annexTop.h) ||
                      (px >= BUILDING.annexBottom.x && px <= BUILDING.annexBottom.x + BUILDING.annexBottom.w &&
                       py >= BUILDING.annexBottom.y && py <= BUILDING.annexBottom.y + BUILDING.annexBottom.h);
      const inInnerGreen = BUILDING.innerGreens.some(g =>
        px >= g.x && px <= g.x + g.w && py >= g.y && py <= g.y + g.h
      );
      const inGreenPad = (px >= BUILDING.greenTop.x && px <= BUILDING.greenTop.x + BUILDING.greenTop.w &&
                          py >= BUILDING.greenTop.y && py <= BUILDING.greenTop.y + BUILDING.greenTop.h) ||
                         (px >= BUILDING.greenBottom.x && px <= BUILDING.greenBottom.x + BUILDING.greenBottom.w &&
                          py >= BUILDING.greenBottom.y && py <= BUILDING.greenBottom.y + BUILDING.greenBottom.h);
      if (!inMain && !inAnnex) {
        grid[r * COLS + c] = 1;
      }
      if (inInnerGreen || inGreenPad) {
        grid[r * COLS + c] = 1;
      }
    }
  }
  // Mark room cells as blocked (with padding for walls)
  for (const p of pois) {
    if (p.type !== "room") continue;
    const halfW = (p.w ?? 22) / 2 + 2;
    const halfH = (p.h ?? 22) / 2 + 2;
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

  // Fallback: direct line (should not happen with valid data)
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
