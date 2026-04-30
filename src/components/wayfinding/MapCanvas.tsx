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
          {/* Corridors hint */}
          <g stroke="oklch(1 0 0 / 0.06)" strokeWidth="22" strokeLinecap="round">
            <line x1="500" y1="60" x2="500" y2="640" />
            <line x1="60" y1="350" x2="940" y2="350" />
          </g>

          {/* POIs */}
          {pois.map((p) => {
            const isOrigin = p.id === origin.id;
            const isDest = p.id === destination.id;
            if (isOrigin || isDest) return null;
            return (
              <g key={p.id}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={6}
                  fill="oklch(1 0 0 / 0.35)"
                  stroke="oklch(1 0 0 / 0.5)"
                  strokeWidth="1"
                />
                <text
                  x={p.x + 12}
                  y={p.y + 4}
                  fontSize="11"
                  fill="oklch(1 0 0 / 0.55)"
                  fontFamily="Inter, sans-serif"
                  fontWeight={500}
                >
                  {p.name}
                </text>
              </g>
            );
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
