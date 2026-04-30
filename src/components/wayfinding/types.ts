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
  x: number; // canvas coords (0-1000)
  y: number; // canvas coords (0-700)
};

// Salas baseadas na planta real do piso (referência: imagem enviada).
// Coordenadas adaptadas para o viewBox 1000x700.
export const POIS: Poi[] = [
  // Fileira superior — série 1100
  { id: "r-1100", name: "Sala 1100", type: "room", x: 110, y: 95 },
  { id: "r-1101", name: "Sala 1101", type: "room", x: 175, y: 95 },
  { id: "r-1102", name: "Sala 1102", type: "room", x: 240, y: 95 },
  { id: "r-1103", name: "Sala 1103", type: "room", x: 305, y: 95 },
  { id: "r-1106", name: "Sala 1106", type: "room", x: 400, y: 95 },
  { id: "r-1107", name: "Sala 1107", type: "room", x: 565, y: 95 },
  { id: "r-1109", name: "Sala 1109", type: "room", x: 670, y: 95 },
  { id: "r-1110", name: "Sala 1110", type: "room", x: 735, y: 95 },
  { id: "r-1217", name: "Sala 1217", type: "room", x: 800, y: 95 },

  // Segunda fileira — série 1200
  { id: "r-1200", name: "Sala 1200", type: "room", x: 110, y: 175 },
  { id: "r-1203", name: "Sala 1203", type: "room", x: 220, y: 175 },
  { id: "r-1205", name: "Sala 1205", type: "room", x: 320, y: 175 },
  { id: "r-1207", name: "Sala 1207", type: "room", x: 420, y: 175 },
  { id: "r-1211", name: "Sala 1211", type: "room", x: 600, y: 175 },
  { id: "r-1212", name: "Sala 1212", type: "room", x: 660, y: 175 },
  { id: "r-1214", name: "Sala 1214", type: "room", x: 730, y: 175 },
  { id: "r-1216", name: "Sala 1216", type: "room", x: 800, y: 215 },

  // Centro — série 1400
  { id: "r-1400", name: "Sala 1400", type: "room", x: 290, y: 360 },
  { id: "r-1413", name: "Sala 1413", type: "room", x: 640, y: 320 },
  { id: "r-1417", name: "Sala 1417", type: "room", x: 760, y: 365 },
  { id: "r-1419", name: "Sala 1419", type: "room", x: 800, y: 545 },

  // Série 1500
  { id: "r-1500", name: "Sala 1500", type: "room", x: 130, y: 430 },
  { id: "r-1504", name: "Sala 1504", type: "room", x: 130, y: 545 },
  { id: "r-1505", name: "Sala 1505", type: "room", x: 230, y: 545 },
  { id: "r-1506", name: "Sala 1506", type: "room", x: 290, y: 545 },
  { id: "r-1507", name: "Sala 1507", type: "room", x: 345, y: 545 },
  { id: "r-1508", name: "Sala 1508", type: "room", x: 400, y: 545 },
  { id: "r-1510", name: "Sala 1510", type: "room", x: 455, y: 545 },
  { id: "r-1511", name: "Sala 1511", type: "room", x: 510, y: 545 },
  { id: "r-1516", name: "Sala 1516", type: "room", x: 670, y: 545 },
  { id: "r-1517", name: "Sala 1517", type: "room", x: 735, y: 545 },

  // Série 1600
  { id: "r-1604", name: "Sala 1604", type: "room", x: 285, y: 625 },
  { id: "r-1605", name: "Sala 1605", type: "room", x: 345, y: 625 },
  { id: "r-1606", name: "Sala 1606", type: "room", x: 400, y: 625 },
  { id: "r-1607", name: "Sala 1607", type: "room", x: 455, y: 625 },

  // Banheiros (referência da planta)
  { id: "wc-1210", name: "Banheiros — Setor 1210", type: "restroom", x: 555, y: 175 },
  { id: "wc-fem", name: "Banheiro Feminino — 1415", type: "restroom-female", x: 600, y: 365 },
  { id: "wc-mas", name: "Banheiro Masculino — 1414", type: "restroom-male", x: 555, y: 365 },
  { id: "wc-1512", name: "Banheiros — Setor 1512", type: "restroom", x: 600, y: 545 },

  // Elevadores
  { id: "elev-1", name: "Elevador Norte", type: "elevator", x: 510, y: 95 },
  { id: "elev-2", name: "Elevador Central", type: "elevator", x: 510, y: 360 },
  { id: "elev-3", name: "Elevador Sul", type: "elevator", x: 510, y: 625 },
  { id: "elev-w", name: "Elevador Oeste", type: "elevator", x: 90, y: 470 },

  // Escadas
  { id: "stairs-n", name: "Escada Norte", type: "stairs", x: 700, y: 365 },
  { id: "stairs-s", name: "Escada Sul — Emergência", type: "stairs", x: 250, y: 470 },

  // Entrada / Saídas
  { id: "entrance", name: "Entrada Principal", type: "entrance", x: 90, y: 660 },
  { id: "exit-e", name: "Saída de Emergência Leste", type: "exit", x: 880, y: 470 },
  { id: "exit-s", name: "Saída de Emergência Sul", type: "exit", x: 555, y: 670 },
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
