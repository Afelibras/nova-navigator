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
// Building outline matches the photo: rectangular main block + east annex.
export const BUILDING = {
  main: { x: 80, y: 70, w: 760, h: 580 },
  annexTop: { x: 840, y: 90, w: 110, h: 230 },
  annexBottom: { x: 840, y: 360, w: 110, h: 240 },
  // East decorative green pads
  greenTop: { x: 870, y: 110, w: 70, h: 200 },
  greenBottom: { x: 870, y: 380, w: 70, h: 200 },
  // Inner green courtyards (the dark green strips inside)
  innerGreens: [
    { x: 290, y: 240, w: 270, h: 90 },
    { x: 600, y: 240, w: 220, h: 90 },
    { x: 290, y: 470, w: 280, h: 70 },
    { x: 600, y: 470, w: 220, h: 70 },
  ],
  // Corridors (the dark grey strips)
  corridorsH: [
    { x: 80, y: 350, w: 760, h: 38 }, // main horizontal corridor
    { x: 80, y: 595, w: 760, h: 28 }, // bottom corridor
  ],
  corridorsV: [
    { x: 555, y: 70, w: 38, h: 580 }, // main vertical corridor (split between blocks)
  ],
};

// Rooms common across floors (we vary the prefix per floor: 1 = floor 1 -> "11xx", etc.).
// Coordinates are for the BLOCK CENTER + width/height. The numeric suffix matches the photo.
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
  { suffix: "00", x: 110, y: 200, w: 40, h: 70, /* 1200 narrow column */ },
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
  { suffix: "00", x: 290, y: 415, w: 130, h: 56 }, // 1400
  { suffix: "13", x: 700, y: 405, w: 110, h: 70 }, // 1413
  { suffix: "17", x: 760, y: 470, w: 100, h: 60 }, // 1417
  { suffix: "19", x: 820, y: 575, w: 50, h: 60 }, // 1419 (south-east)
];

const FIFTH_ROW_LEFT: RoomTemplate[] = [
  { suffix: "00", x: 110, y: 460, w: 38, h: 70 }, // 1500 narrow
  { suffix: "04", x: 110, y: 575, w: 30, h: 56 }, // 1504
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
  // Floor numbering: floor 1 => "1Xxx", floor 2 => "2Xxx", etc.
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

  // Shared infrastructure on every floor — same coordinates, distinct ids.
  const infra: Poi[] = [
    // Elevators (brown columns in the photo)
    { id: `elev-n-f${f}`, name: "Elevador Norte", type: "elevator", floor: f, x: 555, y: 200, w: 30, h: 60 },
    { id: `elev-s-f${f}`, name: "Elevador Sul", type: "elevator", floor: f, x: 555, y: 720 - 100, w: 30, h: 50 },
    { id: `elev-w-f${f}`, name: "Elevador Oeste", type: "elevator", floor: f, x: 95, y: 405, w: 24, h: 40 },

    // Stairs (the small staircase shape near 1417)
    { id: `stairs-e-f${f}`, name: "Escada Leste", type: "stairs", floor: f, x: 700, y: 470, w: 28, h: 40 },
    { id: `stairs-s-f${f}`, name: "Escada Sul — Emergência", type: "stairs", floor: f, x: 230, y: 700 - 60, w: 26, h: 36 },

    // Restrooms
    { id: `wc-male-n-f${f}`, name: "Banheiro Masculino — Norte", type: "restroom-male", floor: f, x: 525, y: 200, w: 22, h: 40 },
    { id: `wc-fem-c-f${f}`, name: "Banheiro Feminino — Central", type: "restroom-female", floor: f, x: 600, y: 470, w: 30, h: 40 },
    { id: `wc-fem-s-f${f}`, name: "Banheiro Feminino — Sul", type: "restroom-female", floor: f, x: 660, y: 575, w: 28, h: 38 },
    { id: `wc-male-w-f${f}`, name: "Banheiro Masculino — Oeste", type: "restroom-male", floor: f, x: 113, y: 380, w: 18, h: 24 },
  ];

  // Floor 1 also has the main entrance + emergency exit
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

// Backwards-compat export (some components imported `POIS`).
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

// Corridor network — the route is constrained to these axes so the line never
// crosses through rooms. Horizontal axes run east-west; the vertical axis splits
// the building. A POI "exits" through the nearest corridor (its door).
const CORRIDORS_H = [369, 609]; // y of main + bottom corridors (centers of grey strips)
const CORRIDORS_V = [574];      // x of central vertical corridor

function nearest(value: number, options: number[]): number {
  return options.reduce((best, v) =>
    Math.abs(v - value) < Math.abs(best - value) ? v : best,
  options[0]);
}

/**
 * Door point of a POI: the point on the block's edge that touches the closest
 * corridor. For rooms above the main corridor we exit downward, below it
 * upward, etc. For services without w/h we just use the center.
 */
function doorOf(p: Poi): { x: number; y: number; axis: "h" | "v"; corridorY: number; corridorX: number } {
  const corridorY = nearest(p.y, CORRIDORS_H);
  const corridorX = nearest(p.x, CORRIDORS_V);
  // Choose whether the room exits to a horizontal or vertical corridor by
  // picking whichever is closer to the block center.
  const dH = Math.abs(p.y - corridorY);
  const dV = Math.abs(p.x - corridorX);
  const axis: "h" | "v" = dH <= dV ? "h" : "v";

  const halfW = (p.w ?? 0) / 2;
  const halfH = (p.h ?? 0) / 2;

  if (axis === "h") {
    // Door is on the top or bottom edge, aligned with the room's x.
    const doorY = p.y + (corridorY > p.y ? halfH : -halfH);
    return { x: p.x, y: doorY, axis, corridorY, corridorX };
  } else {
    const doorX = p.x + (corridorX > p.x ? halfW : -halfW);
    return { x: doorX, y: p.y, axis, corridorY, corridorX };
  }
}

/**
 * Build a route that stays inside the corridor network.
 * Path: A center -> A door -> A corridor -> [vertical corridor if needed]
 *      -> B corridor -> B door -> B center.
 */
export function buildRoute(a: Poi, b: Poi): { x: number; y: number }[] {
  const da = doorOf(a);
  const db = doorOf(b);

  const pts: { x: number; y: number }[] = [];
  pts.push({ x: a.x, y: a.y });          // start at room center
  pts.push({ x: da.x, y: da.y });        // walk to door

  // Step onto the corridor lane next to A
  const aLaneY = da.corridorY;
  pts.push({ x: da.x, y: aLaneY });

  // If destination uses a different horizontal lane, transit via vertical corridor
  const bLaneY = db.corridorY;
  if (aLaneY !== bLaneY) {
    const vx = CORRIDORS_V[0];
    pts.push({ x: vx, y: aLaneY });
    pts.push({ x: vx, y: bLaneY });
    pts.push({ x: db.x, y: bLaneY });
  } else {
    // Same horizontal lane — just walk along it
    pts.push({ x: db.x, y: aLaneY });
  }

  pts.push({ x: db.x, y: db.y });        // arrive at door
  pts.push({ x: b.x, y: b.y });          // into room center

  // Remove consecutive duplicates
  return pts.filter((p, i) => i === 0 || p.x !== pts[i - 1].x || p.y !== pts[i - 1].y);
}

export function routeLength(points: { x: number; y: number }[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return len * 0.12; // unit -> meters
}

export type RoutePlan = {
  segments: {
    floor: number;
    points: { x: number; y: number }[];
    from: Poi;
    to: Poi;
  }[];
  /** Meters total */
  distance: number;
  /** Seconds total */
  duration: number;
  /** Floor change penalty seconds (waiting for elevator) */
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

  // Multi-floor: walk to nearest elevator on origin floor, "ride" elevator,
  // then walk from the matching elevator on destination floor to the goal.
  const elevA = nearestElevator(origin);
  // Match by id prefix (without floor suffix) so user lands on same shaft.
  const shaft = elevA.id.replace(/-f\d+$/, "");
  const elevB =
    poisOnFloor(destination.floor).find((p) => p.id.startsWith(shaft)) ??
    nearestElevator(destination);

  const seg1 = buildRoute(origin, elevA);
  const seg2 = buildRoute(elevB, destination);
  const d1 = routeLength(seg1);
  const d2 = routeLength(seg2);
  const elevatorWait = 25; // seconds
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
