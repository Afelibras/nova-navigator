export type Poi = {
  id: string;
  name: string;
  type: "elevator" | "stairs" | "room" | "entrance" | "restroom" | "cafe";
  x: number; // canvas coords (0-1000)
  y: number; // canvas coords (0-700)
};

export const POIS: Poi[] = [
  { id: "elev-a", name: "Elevador A", type: "elevator", x: 120, y: 130 },
  { id: "elev-b", name: "Elevador B", type: "elevator", x: 880, y: 540 },
  { id: "stairs-1", name: "Escada Norte", type: "stairs", x: 500, y: 80 },
  { id: "entrance", name: "Entrada Principal", type: "entrance", x: 500, y: 660 },
  { id: "room-101", name: "Sala 101 — Auditório", type: "room", x: 260, y: 260 },
  { id: "room-102", name: "Sala 102 — Reuniões", type: "room", x: 420, y: 200 },
  { id: "room-201", name: "Sala 201 — Lab UX", type: "room", x: 680, y: 240 },
  { id: "room-202", name: "Sala 202 — Diretoria", type: "room", x: 820, y: 320 },
  { id: "room-301", name: "Sala 301 — Treinamento", type: "room", x: 320, y: 460 },
  { id: "room-302", name: "Sala 302 — Coworking", type: "room", x: 600, y: 480 },
  { id: "wc-1", name: "Banheiros", type: "restroom", x: 200, y: 540 },
  { id: "cafe", name: "Café & Lounge", type: "cafe", x: 720, y: 420 },
];

export function findPoi(id: string) {
  return POIS.find((p) => p.id === id)!;
}

// Simple Manhattan-ish corridor route between two points using a midpoint.
export function buildRoute(a: Poi, b: Poi): { x: number; y: number }[] {
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  return [
    { x: a.x, y: a.y },
    { x: a.x, y: mid.y },
    { x: b.x, y: mid.y },
    { x: b.x, y: b.y },
  ];
}

export function routeLength(points: { x: number; y: number }[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  // 1 unit ≈ 0.12m for realistic indoor scale
  return len * 0.12;
}

export function nearestPoi(p: Poi, exclude?: string): Poi {
  return [...POIS]
    .filter((x) => x.id !== p.id && x.id !== exclude)
    .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
}
