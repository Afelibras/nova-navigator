import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Minus, LocateFixed, Layers, ArrowUp, ArrowDown } from "lucide-react";
import type { Poi, RoutePlan } from "./types";
import { BUILDING, poisOnFloor } from "./types";

type Props = {
  origin: Poi;
  destination: Poi;
  plan: RoutePlan | null;
  loading: boolean;
  floor: number;
  onFloorChange: (floor: number) => void;
  floors: readonly number[];
};

const VIEW_W = 1000;
const VIEW_H = 720;

// --- Visual palette (matches the photo) ---
const COLOR_FLOOR_BG = "oklch(0.22 0.04 260)";
const COLOR_CORRIDOR = "oklch(0.30 0.02 260)";
const COLOR_CORRIDOR_EDGE = "oklch(0.18 0.02 260)";
const COLOR_ROOM = "oklch(0.55 0.10 220)"; // teal/blue rooms
const COLOR_ROOM_STROKE = "oklch(0.18 0.04 260)";
const COLOR_GREEN = "oklch(0.45 0.10 175)"; // dark green courtyards
const COLOR_ANNEX = "oklch(0.30 0.10 255)"; // navy east annex
const COLOR_GREEN_PAD = "oklch(0.40 0.09 175)";
const COLOR_ELEVATOR = "oklch(0.32 0.08 30)"; // brown
const COLOR_RESTROOM_M = "oklch(0.40 0.18 295)";
const COLOR_RESTROOM_F = "oklch(0.45 0.18 330)";
const COLOR_STAIRS = "oklch(0.50 0.12 260)";
const COLOR_ENTRANCE = "oklch(0.55 0.18 165)";
const COLOR_EXIT = "oklch(0.55 0.20 30)";
const COLOR_CAFE = "oklch(0.55 0.14 60)";

export function MapCanvas({
  origin,
  destination,
  plan,
  loading,
  floor,
  onFloorChange,
  floors,
}: Props) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [routeVisible, setRouteVisible] = useState(false);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    setRouteVisible(false);
    if (loading) return;
    const t = setTimeout(() => setRouteVisible(true), 80);
    return () => clearTimeout(t);
  }, [origin.id, destination.id, loading, floor]);

  const pois = useMemo(() => poisOnFloor(floor), [floor]);
  const floorSegment = plan?.segments.find((s) => s.floor === floor);

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

  const showOrigin = origin.floor === floor;
  const showDest = destination.floor === floor;
  if (!plan) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <p>Aguardando dados do mapa...</p>
    </div>
    );
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
            <pattern id="floor-tex" patternUnits="userSpaceOnUse" width="22" height="22">
              <rect width="22" height="22" fill={COLOR_FLOOR_BG} />
              <path d="M0 22 L22 0" stroke="oklch(1 0 0 / 0.025)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Building shell */}
          <g>
            {/* Main building floor texture */}
            <rect
              x={BUILDING.main.x}
              y={BUILDING.main.y}
              width={BUILDING.main.w}
              height={BUILDING.main.h}
              rx="6"
              fill="url(#floor-tex)"
              stroke="oklch(1 0 0 / 0.1)"
              strokeWidth="2"
            />

            {/* East annex (navy) */}
            <rect
              x={BUILDING.annexTop.x}
              y={BUILDING.annexTop.y}
              width={BUILDING.annexTop.w}
              height={BUILDING.annexTop.h}
              fill={COLOR_ANNEX}
              stroke={COLOR_ROOM_STROKE}
              strokeWidth="2"
            />
            <rect
              x={BUILDING.annexBottom.x}
              y={BUILDING.annexBottom.y}
              width={BUILDING.annexBottom.w}
              height={BUILDING.annexBottom.h}
              fill={COLOR_ANNEX}
              stroke={COLOR_ROOM_STROKE}
              strokeWidth="2"
            />
            {/* Green pads inside annex */}
            <rect
              x={BUILDING.greenTop.x}
              y={BUILDING.greenTop.y}
              width={BUILDING.greenTop.w}
              height={BUILDING.greenTop.h}
              fill={COLOR_GREEN_PAD}
            />
            <rect
              x={BUILDING.greenBottom.x}
              y={BUILDING.greenBottom.y}
              width={BUILDING.greenBottom.w}
              height={BUILDING.greenBottom.h}
              fill={COLOR_GREEN_PAD}
            />
          </g>

          {/* Corridors */}
          <g>
            {BUILDING.corridorsH.map((c, i) => (
              <rect
                key={`ch-${i}`}
                x={c.x}
                y={c.y}
                width={c.w}
                height={c.h}
                fill={COLOR_CORRIDOR}
                stroke={COLOR_CORRIDOR_EDGE}
                strokeWidth="1"
              />
            ))}
            {BUILDING.corridorsV.map((c, i) => (
              <rect
                key={`cv-${i}`}
                x={c.x}
                y={c.y}
                width={c.w}
                height={c.h}
                fill={COLOR_CORRIDOR}
                stroke={COLOR_CORRIDOR_EDGE}
                strokeWidth="1"
              />
            ))}
            {/* Corridor markings (zebra dashes) */}
            <g
              stroke="oklch(0.78 0.18 250 / 0.18)"
              strokeWidth="1.4"
              strokeDasharray="6 8"
              fill="none"
            >
              <line x1="90" y1="369" x2="830" y2="369" />
              <line x1="574" y1="80" x2="574" y2="640" />
            </g>
          </g>

          {/* Inner courtyards (dark green strips) */}
          <g>
            {BUILDING.innerGreens.map((g, i) => (
              <rect
                key={`g-${i}`}
                x={g.x}
                y={g.y}
                width={g.w}
                height={g.h}
                fill={COLOR_GREEN}
                stroke={COLOR_ROOM_STROKE}
                strokeWidth="1.5"
              />
            ))}
          </g>

          {/* POIs as blocks */}
          <g>
            {pois.map((p) => (
              <PoiBlock
                key={p.id}
                poi={p}
                isOrigin={p.id === origin.id && showOrigin}
                isDestination={p.id === destination.id && showDest}
              />
            ))}
          </g>

          {/* Route on this floor */}
          {routeVisible && floorSegment && (
            <g>
              <path
                d={pathD(floorSegment.points)}
                fill="none"
                stroke="url(#route-grad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.35"
                filter="url(#glow)"
              />
              <path
                d={pathD(floorSegment.points)}
                fill="none"
                stroke="url(#route-grad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="14 18"
                style={{ animation: "flow 1.6s linear infinite" }}
              />
            </g>
          )}

          {/* Origin / Destination markers (only when on this floor) */}
          {showOrigin && (
            <g transform={`translate(${origin.x}, ${origin.y})`}>
              <circle r="11" fill="oklch(0.68 0.19 255)" filter="url(#glow)" />
              <circle r="4.5" fill="oklch(0.99 0 0)" />
            </g>
          )}
          {showDest && (
            <g transform={`translate(${destination.x}, ${destination.y - 8})`}>
              <ellipse cx="0" cy="14" rx="10" ry="3" fill="oklch(0 0 0 / 0.45)" />
              <path
                d="M0,-22 C-12,-22 -16,-12 -16,-6 C-16,4 -4,12 0,16 C4,12 16,4 16,-6 C16,-12 12,-22 0,-22 Z"
                fill="url(#route-grad)"
                filter="url(#glow)"
              />
              <circle cx="0" cy="-8" r="5" fill="oklch(0.99 0 0)" />
            </g>
          )}
        </svg>

        {showOrigin && (
          <SonarOverlay x={origin.x} y={origin.y} zoom={zoom} offset={offset} />
        )}
      </div>

      {/* Cross-floor hint */}
      {plan.floorChange && (
        <div className="pointer-events-none absolute left-1/2 top-20 z-20 -translate-x-1/2 lg:top-6">
          <div className="glass rounded-full px-3 py-1.5 text-[11px] flex items-center gap-2">
            <ArrowUp className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">Rota usa</span>
            <span className="font-semibold">elevador</span>
            <span className="text-muted-foreground">•</span>
            <span className="font-semibold">
              {origin.floor}º <ArrowDown className="inline h-3 w-3" /> {destination.floor}º
            </span>
          </div>
        </div>
      )}

      {/* Loading indicator — small badge, does not block map */}
      {loading && (
        <div className="absolute left-1/2 top-20 z-30 -translate-x-1/2 lg:top-6">
          <div className="glass rounded-full px-4 py-2 flex items-center gap-3">
            <div className="relative h-5 w-5">
              <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"
                style={{ animationDuration: "0.9s" }}
              />
            </div>
            <span className="text-xs font-medium">Calculando rota…</span>
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
          aria-label="Centralizar"
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

      {/* Floor selector */}
      <div className="absolute right-4 top-1/2 z-20 -translate-y-1/2">
        <div className="glass rounded-2xl p-1 flex flex-col gap-1">
          <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground text-center pt-1.5 pb-0.5">
            Andar
          </p>
          {[...floors].slice().reverse().map((f) => {
            const active = f === floor;
            const hasOrigin = origin.floor === f;
            const hasDest = destination.floor === f;
            return (
              <button
                key={f}
                onClick={() => onFloorChange(f)}
                className={`relative h-9 w-11 rounded-xl text-sm font-bold tabular-nums transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_0_18px_-4px_var(--primary)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
                aria-label={`Ir para o ${f}º andar`}
              >
                {f}º
                {(hasOrigin || hasDest) && !active && (
                  <span
                    className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full"
                    style={{
                      background: hasOrigin ? "var(--primary)" : "var(--accent)",
                      boxShadow: `0 0 8px ${hasOrigin ? "var(--primary)" : "var(--accent)"}`,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Compass / scale */}
      <div className="absolute left-4 top-4 z-20 glass rounded-xl px-3 py-2 flex items-center gap-3 text-xs">
        <div className="relative h-6 w-6">
          <div className="absolute inset-0 rounded-full border border-border" />
          <div className="absolute left-1/2 top-0 -translate-x-1/2 text-[10px] font-bold text-primary">
            N
          </div>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="text-muted-foreground">
          Piso <span className="text-foreground font-semibold">{String(floor).padStart(2, "0")}</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="text-muted-foreground">
          Zoom <span className="text-foreground font-semibold">{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute left-4 bottom-4 z-20 glass rounded-xl px-3 py-2 hidden sm:flex items-center gap-3 text-[10px] uppercase tracking-wider">
        <LegendDot color={COLOR_ROOM} label="Salas" />
        <LegendDot color={COLOR_ELEVATOR} label="Elevador" />
        <LegendDot color={COLOR_STAIRS} label="Escada" />
        <LegendDot color={COLOR_RESTROOM_F} label="Banheiro" />
        <LegendDot color={COLOR_ENTRANCE} label="Entrada" />
        <LegendDot color={COLOR_EXIT} label="Saída" />
      </div>
    </div>
  );
}

function pathD(points: { x: number; y: number }[]) {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

function PoiBlock({
  poi,
  isOrigin,
  isDestination,
}: {
  poi: Poi;
  isOrigin: boolean;
  isDestination: boolean;
}) {
  const w = poi.w ?? 22;
  const h = poi.h ?? 22;
  const x = poi.x - w / 2;
  const y = poi.y - h / 2;

  const fill = blockColor(poi.type);
  const isHighlighted = isOrigin || isDestination;
  const stroke = isHighlighted ? "oklch(0.99 0 0)" : COLOR_ROOM_STROKE;
  const strokeWidth = isHighlighted ? 2.4 : 1.5;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={3}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Glyph for non-room types */}
      {poi.type !== "room" && (
        <g
          transform={`translate(${poi.x}, ${poi.y})`}
          fill="none"
          stroke="oklch(0.99 0 0 / 0.95)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <PoiGlyph type={poi.type} />
        </g>
      )}
      {/* Room number label */}
      {poi.type === "room" && poi.short && w >= 36 && (
        <text
          x={poi.x}
          y={poi.y + 3}
          textAnchor="middle"
          fontSize={Math.min(11, Math.max(8, w / 5))}
          fontFamily="Inter, sans-serif"
          fontWeight={700}
          fill="oklch(0.99 0 0 / 0.85)"
          style={{ pointerEvents: "none" }}
        >
          {poi.short}
        </text>
      )}
      {poi.type === "room" && poi.short && w < 36 && (
        <text
          x={poi.x}
          y={poi.y + 3}
          textAnchor="middle"
          fontSize={7}
          fontFamily="Inter, sans-serif"
          fontWeight={700}
          fill="oklch(0.99 0 0 / 0.8)"
          style={{ pointerEvents: "none" }}
        >
          {poi.short.slice(-2)}
        </text>
      )}
    </g>
  );
}

function blockColor(type: Poi["type"]): string {
  switch (type) {
    case "elevator":
      return COLOR_ELEVATOR;
    case "stairs":
      return COLOR_STAIRS;
    case "restroom":
    case "restroom-male":
      return COLOR_RESTROOM_M;
    case "restroom-female":
      return COLOR_RESTROOM_F;
    case "entrance":
      return COLOR_ENTRANCE;
    case "exit":
      return COLOR_EXIT;
    case "cafe":
      return COLOR_CAFE;
    case "room":
    default:
      return COLOR_ROOM;
  }
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
    case "restroom":
      return (
        <>
          <circle cx="0" cy="-4" r="2" />
          <line x1="0" y1="-2" x2="0" y2="4" />
          <line x1="-3" y1="0" x2="3" y2="0" />
        </>
      );
    case "cafe":
      return (
        <>
          <path d="M -4 -2 L -4 4 Q -4 6 -2 6 L 2 6 Q 4 6 4 4 L 4 -2 Z" />
          <path d="M 4 0 Q 7 0 7 3 Q 7 5 4 5" />
        </>
      );
    default:
      return null;
  }
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
