import { useEffect, useRef, useState } from "react";
import { Plus, Minus, LocateFixed, Layers } from "lucide-react";
import type { Poi } from "./types";
import { buildRoute } from "./types";

type Props = {
  origin: Poi;
  destination: Poi;
  pois: Poi[];
  loading: boolean;
};

const VIEW_W = 1000;
const VIEW_H = 700;

export function MapCanvas({ origin, destination, pois, loading }: Props) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [routeVisible, setRouteVisible] = useState(false);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    setRouteVisible(false);
    if (loading) return;
    const t = setTimeout(() => setRouteVisible(true), 80);
    return () => clearTimeout(t);
  }, [origin.id, destination.id, loading]);

  const route = buildRoute(origin, destination);
  const pathD = route.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  function recenter() {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    setOffset({
      x: dragRef.current.ox + (e.clientX - dragRef.current.x),
      y: dragRef.current.oy + (e.clientY - dragRef.current.y),
    });
  }
  function onPointerUp() {
    dragRef.current = null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden grid-bg">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--primary), transparent)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--accent), transparent)" }}
      />

      <div
        className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-full w-full"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transition: dragRef.current ? "none" : "transform 0.35s cubic-bezier(.2,.8,.2,1)",
          }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="route-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.78 0.18 250)" />
              <stop offset="100%" stopColor="oklch(0.84 0.16 165)" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Floorplan walls (decorative) */}
          <g stroke="oklch(1 0 0 / 0.18)" strokeWidth="2" fill="oklch(1 0 0 / 0.02)">
            <rect x="40" y="40" width="920" height="620" rx="16" />
            <rect x="80" y="80" width="380" height="220" rx="8" />
            <rect x="540" y="80" width="380" height="220" rx="8" />
            <rect x="80" y="380" width="380" height="240" rx="8" />
            <rect x="540" y="380" width="380" height="240" rx="8" />
          </g>

          {/* Corridors — base */}
          <g>
            {/* Horizontal corridors */}
            <rect x="60" y="120" width="880" height="22" rx="4" fill="oklch(1 0 0 / 0.05)" />
            <rect x="60" y="340" width="880" height="44" rx="6" fill="oklch(1 0 0 / 0.07)" />
            <rect x="60" y="570" width="880" height="22" rx="4" fill="oklch(1 0 0 / 0.05)" />
            {/* Vertical corridors */}
            <rect x="490" y="60" width="44" height="600" rx="6" fill="oklch(1 0 0 / 0.07)" />
            <rect x="60" y="60" width="22" height="600" rx="4" fill="oklch(1 0 0 / 0.04)" />
          </g>
          {/* Corridor center dashed guide lines */}
          <g
            stroke="oklch(0.78 0.18 250 / 0.25)"
            strokeWidth="1"
            strokeDasharray="6 8"
            fill="none"
          >
            <line x1="60" y1="362" x2="940" y2="362" />
            <line x1="512" y1="60" x2="512" y2="660" />
          </g>

          {/* Corridor labels */}
          <g fontFamily="Inter, sans-serif" fontSize="9" fill="oklch(1 0 0 / 0.35)" fontWeight={600} letterSpacing="2">
            <text x="70" y="357" textAnchor="start">CORREDOR PRINCIPAL</text>
            <text x="520" y="75" textAnchor="start">EIXO N–S</text>
          </g>

          {/* POIs */}
          {pois.map((p) => {
            const isOrigin = p.id === origin.id;
            const isDest = p.id === destination.id;
            if (isOrigin || isDest) return null;
            return <PoiMarker key={p.id} poi={p} />;
          })}

          {/* Route */}
          {routeVisible && (
            <>
              <path
                d={pathD}
                fill="none"
                stroke="url(#route-grad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.35"
                filter="url(#glow)"
              />
              <path
                d={pathD}
                fill="none"
                stroke="url(#route-grad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="14 18"
                style={{ animation: "flow 1.6s linear infinite" }}
              />
            </>
          )}

          {/* Destination pin (3D minimalist) */}
          <g transform={`translate(${destination.x}, ${destination.y})`}>
            <ellipse cx="0" cy="6" rx="10" ry="3" fill="oklch(0 0 0 / 0.45)" />
            <path
              d="M0,-28 C-12,-28 -16,-18 -16,-12 C-16,-2 -4,6 0,10 C4,6 16,-2 16,-12 C16,-18 12,-28 0,-28 Z"
              fill="url(#route-grad)"
              filter="url(#glow)"
            />
            <circle cx="0" cy="-14" r="5" fill="oklch(0.99 0 0)" />
          </g>

          {/* Origin marker (sonar pulse rendered via HTML overlay below for crisper effect) */}
          <g transform={`translate(${origin.x}, ${origin.y})`}>
            <circle r="9" fill="oklch(0.68 0.19 255)" filter="url(#glow)" />
            <circle r="4" fill="oklch(0.99 0 0)" />
          </g>
        </svg>

        {/* Sonar pulse overlay positioned via percentages of viewBox (scaled with svg) */}
        <SonarOverlay
          x={origin.x}
          y={origin.y}
          zoom={zoom}
          offset={offset}
        />
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-background/40 backdrop-blur-sm animate-fade-up">
          <div className="glass-strong rounded-2xl px-6 py-5 flex items-center gap-4">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"
                style={{ animationDuration: "0.9s" }}
              />
              <div className="absolute inset-2 rounded-full bg-primary/30 blur-md" />
            </div>
            <div>
              <p className="text-sm font-semibold">Calculando melhor rota…</p>
              <p className="text-xs text-muted-foreground">Analisando corredores e obstáculos</p>
            </div>
          </div>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute right-4 top-4 z-20 flex flex-col gap-2">
        <div className="glass rounded-xl p-1 flex flex-col">
          <button
            onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.2).toFixed(2)))}
            className="h-10 w-10 grid place-items-center rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Aumentar zoom"
          >
            <Plus className="h-5 w-5" />
          </button>
          <div className="h-px mx-2 bg-border" />
          <button
            onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(2)))}
            className="h-10 w-10 grid place-items-center rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Diminuir zoom"
          >
            <Minus className="h-5 w-5" />
          </button>
        </div>
        <button
          onClick={recenter}
          className="glass rounded-xl h-10 w-10 grid place-items-center hover:bg-white/5 transition-colors"
          aria-label="Centralizar na minha posição"
          title="Centralizar"
        >
          <LocateFixed className="h-5 w-5 text-primary" />
        </button>
        <button
          className="glass rounded-xl h-10 w-10 grid place-items-center hover:bg-white/5 transition-colors"
          aria-label="Camadas"
          title="Camadas"
        >
          <Layers className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Compass / scale */}
      <div className="absolute left-4 top-4 z-20 glass rounded-xl px-3 py-2 flex items-center gap-3 text-xs">
        <div className="relative h-6 w-6">
          <div className="absolute inset-0 rounded-full border border-border" />
          <div className="absolute left-1/2 top-0 -translate-x-1/2 text-[10px] font-bold text-primary">N</div>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="text-muted-foreground">
          Piso <span className="text-foreground font-semibold">02</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="text-muted-foreground">
          Zoom <span className="text-foreground font-semibold">{Math.round(zoom * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

function SonarOverlay({
  x,
  y,
  zoom,
  offset,
}: {
  x: number;
  y: number;
  zoom: number;
  offset: { x: number; y: number };
}) {
  // Convert SVG coords to % so it follows the svg's preserveAspectRatio mapping.
  const left = `${(x / VIEW_W) * 100}%`;
  const top = `${(y / VIEW_H) * 100}%`;
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
        transformOrigin: "center",
      }}
    >
      <div className="absolute" style={{ left, top }}>
        <span
          className="absolute h-6 w-6 rounded-full"
          style={{
            background: "oklch(0.68 0.19 255 / 0.45)",
            animation: "sonar 2.2s ease-out infinite",
          }}
        />
        <span
          className="absolute h-6 w-6 rounded-full"
          style={{
            background: "oklch(0.68 0.19 255 / 0.35)",
            animation: "sonar 2.2s ease-out infinite",
            animationDelay: "1.1s",
          }}
        />
      </div>
    </div>
  );
}

const MARKER_STYLES: Record<Poi["type"], { color: string; halo: number }> = {
  elevator: { color: "oklch(0.55 0.18 255)", halo: 18 },
  stairs: { color: "oklch(0.62 0.16 280)", halo: 16 },
  room: { color: "oklch(0.42 0.06 260)", halo: 12 },
  entrance: { color: "oklch(0.62 0.18 165)", halo: 20 },
  exit: { color: "oklch(0.60 0.22 30)", halo: 22 },
  restroom: { color: "oklch(0.50 0.10 220)", halo: 16 },
  "restroom-female": { color: "oklch(0.55 0.18 330)", halo: 16 },
  "restroom-male": { color: "oklch(0.50 0.15 240)", halo: 16 },
  cafe: { color: "oklch(0.60 0.16 60)", halo: 14 },
};

function PoiMarker({ poi }: { poi: Poi }) {
  const cfg = MARKER_STYLES[poi.type];
  const showLabel = poi.type === "room" || poi.type === "entrance" || poi.type === "exit";
  return (
    <g>
      <circle cx={poi.x} cy={poi.y} r={cfg.halo} fill={cfg.color} opacity="0.18" />
      <rect
        x={poi.x - 11}
        y={poi.y - 11}
        width={22}
        height={22}
        rx={6}
        fill={cfg.color}
        opacity="0.95"
        stroke="oklch(1 0 0 / 0.5)"
        strokeWidth="1"
      />
      <g
        transform={`translate(${poi.x}, ${poi.y})`}
        fill="none"
        stroke="oklch(0.99 0 0)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <PoiGlyph type={poi.type} />
      </g>
      {showLabel && (
        <text
          x={poi.x + 16}
          y={poi.y + 4}
          fontSize="10"
          fill="oklch(1 0 0 / 0.7)"
          fontFamily="Inter, sans-serif"
          fontWeight={600}
        >
          {poi.name}
        </text>
      )}
    </g>
  );
}

function PoiGlyph({ type }: { type: Poi["type"] }) {
  switch (type) {
    case "elevator":
      return (
        <>
          <path d="M -3 -4 L 0 -7 L 3 -4" />
          <path d="M -3 4 L 0 7 L 3 4" />
          <line x1="0" y1="-7" x2="0" y2="-1" />
          <line x1="0" y1="1" x2="0" y2="7" />
        </>
      );
    case "stairs":
      return <path d="M -6 5 L -2 5 L -2 1 L 2 1 L 2 -3 L 6 -3 L 6 -7" />;
    case "entrance":
      return (
        <>
          <path d="M -5 6 L -5 -6 L 5 -6 L 5 6" />
          <path d="M -2 0 L 5 0" />
          <path d="M 2 -3 L 5 0 L 2 3" />
        </>
      );
    case "exit":
      return (
        <>
          <path d="M -5 -6 L -5 6 L 1 6" />
          <path d="M -1 0 L 6 0" />
          <path d="M 3 -3 L 6 0 L 3 3" />
        </>
      );
    case "restroom-female":
      return (
        <>
          <circle cx="0" cy="-4" r="2" />
          <path d="M -3 4 L 0 -2 L 3 4 Z" />
        </>
      );
    case "restroom-male":
      return (
        <>
          <circle cx="0" cy="-4" r="2" />
          <line x1="0" y1="-2" x2="0" y2="4" />
          <line x1="-3" y1="0" x2="3" y2="0" />
        </>
      );
    case "restroom":
      return (
        <>
          <circle cx="-3" cy="-4" r="1.6" />
          <circle cx="3" cy="-4" r="1.6" />
          <line x1="0" y1="-6" x2="0" y2="6" />
        </>
      );
    case "cafe":
      return (
        <>
          <path d="M -4 -2 L -4 4 Q -4 6 -2 6 L 2 6 Q 4 6 4 4 L 4 -2 Z" />
          <path d="M 4 0 Q 7 0 7 3 Q 7 5 4 5" />
        </>
      );
    case "room":
    default:
      return <circle cx="0" cy="0" r="2" fill="oklch(0.99 0 0)" stroke="none" />;
  }
}

