import {
  DoorOpen,
  CornerUpLeft,
  CornerUpRight,
  ArrowUp,
  MoveHorizontal,
  MoveVertical,
  ArrowUpDown,
  Flag,
  MapPin,
} from "lucide-react";
import type { Poi, RoutePlan } from "./types";

type Props = {
  plan: RoutePlan | null;
  origin: Poi;
  destination: Poi;
  loading: boolean;
};

type Step = {
  icon: React.ReactNode;
  title: string;
  detail?: string;
  meters?: number;
  tone?: "primary" | "accent" | "warn" | "neutral";
};

const M_PER_UNIT = 0.12;

function dirOf(dx: number, dy: number): "N" | "S" | "E" | "O" {
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "E" : "O";
  return dy > 0 ? "S" : "N";
}

function bearingLabel(d: "N" | "S" | "E" | "O") {
  return { N: "norte", S: "sul", E: "leste", O: "oeste" }[d];
}

function turnIcon(prev: string, next: string) {
  // Simple left/right inference based on cardinal turns.
  const order = ["N", "E", "S", "O"];
  const a = order.indexOf(prev);
  const b = order.indexOf(next);
  if (a < 0 || b < 0 || a === b) return <ArrowUp className="h-4 w-4" />;
  const diff = (b - a + 4) % 4;
  if (diff === 1) return <CornerUpRight className="h-4 w-4" />;
  if (diff === 3) return <CornerUpLeft className="h-4 w-4" />;
  return <ArrowUpDown className="h-4 w-4" />;
}

function buildStepsForSegment(
  pts: { x: number; y: number }[],
  from: Poi,
  to: Poi,
  isFinalSegment: boolean,
): Step[] {
  if (pts.length < 2) return [];
  const steps: Step[] = [];

  // 1. Sair pela porta
  steps.push({
    icon: <DoorOpen className="h-4 w-4" />,
    title: `Saia de ${from.name}`,
    detail: "Avance pela porta em direção ao corredor",
    tone: "primary",
  });

  // 2. Walk segments — group consecutive points by direction
  let prevDir: "N" | "S" | "E" | "O" | null = null;
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (dx === 0 && dy === 0) continue;
    const dir = dirOf(dx, dy);
    const meters = Math.hypot(dx, dy) * M_PER_UNIT;
    if (meters < 0.4) continue;

    const isHorizontal = dir === "E" || dir === "O";
    const icon = prevDir
      ? turnIcon(prevDir, dir)
      : isHorizontal
        ? <MoveHorizontal className="h-4 w-4" />
        : <MoveVertical className="h-4 w-4" />;

    steps.push({
      icon,
      title: prevDir
        ? `Vire à ${dir === prevDir ? "frente" : turnSide(prevDir, dir)} e siga ${bearingLabel(dir)}`
        : `Siga pelo corredor a ${bearingLabel(dir)}`,
      detail: isHorizontal ? "Corredor principal" : "Eixo central",
      meters,
      tone: "neutral",
    });
    prevDir = dir;
  }

  // 3. Arrival action — depends on whether `to` is final or a transfer (elevator)
  if (to.type === "elevator" && !isFinalSegment) {
    steps.push({
      icon: <ArrowUpDown className="h-4 w-4" />,
      title: `Pegue o ${to.name}`,
      detail: "Aguarde a chegada da cabine",
      tone: "warn",
    });
  } else {
    steps.push({
      icon: isFinalSegment ? <Flag className="h-4 w-4" /> : <MapPin className="h-4 w-4" />,
      title: isFinalSegment ? `Chegue em ${to.name}` : `Continue até ${to.name}`,
      detail: isFinalSegment ? "Destino final" : undefined,
      tone: "accent",
    });
  }

  return steps;
}

function turnSide(prev: "N" | "S" | "E" | "O", next: "N" | "S" | "E" | "O") {
  const order = ["N", "E", "S", "O"];
  const diff = (order.indexOf(next) - order.indexOf(prev) + 4) % 4;
  if (diff === 1) return "direita";
  if (diff === 3) return "esquerda";
  return "frente";
}

export function buildSteps(plan: RoutePlan): Step[] {
  const out: Step[] = [];
  plan.segments.forEach((seg, i) => {
    const isFinal = i === plan.segments.length - 1;
    if (i > 0) {
      // Between segments — exit the elevator on the new floor
      out.push({
        icon: <ArrowUp className="h-4 w-4" />,
        title: `Saia no ${seg.floor}º andar`,
        detail: `Continue em direção a ${seg.to.name}`,
        tone: "warn",
      });
    }
    out.push(...buildStepsForSegment(seg.points, seg.from, seg.to, isFinal));
  });
  return out;
}

export function RouteSteps({ plan, loading }: Props) {
  if (!plan) return null;

  const steps = buildSteps(plan);

  return (
    <div className="glass-strong rounded-2xl p-4 sm:p-5 w-full animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Passo a passo
          </p>
          <h2 className="text-sm font-semibold leading-none mt-0.5">
            {steps.length} etapa{steps.length === 1 ? "" : "s"}
          </h2>
        </div>
        {plan.floorChange && (
          <span className="text-[10px] uppercase tracking-[0.16em] inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 text-primary px-2 py-1">
            <ArrowUpDown className="h-3 w-3" />
            Multi-andar
          </span>
        )}
      </div>

      <ol className="relative space-y-2 max-h-[42vh] overflow-y-auto pr-1">
        {/* vertical guide line */}
        <span
          aria-hidden
          className="absolute left-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-border to-accent/40"
        />
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                className="relative flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 animate-pulse"
              >
                <div className="h-9 w-9 rounded-full bg-white/[0.06]" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 rounded bg-white/[0.06]" />
                  <div className="h-2.5 w-1/3 rounded bg-white/[0.04]" />
                </div>
              </li>
            ))
          : steps.map((s, i) => (
              <li
                key={i}
                className="relative flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.05] transition-colors p-3 animate-fade-in"
                style={{ animationDelay: `${Math.min(i * 35, 300)}ms` }}
              >
                <div
                  className={`relative h-9 w-9 shrink-0 rounded-full grid place-items-center text-[11px] font-bold ${
                    s.tone === "primary"
                      ? "bg-primary/15 text-primary border border-primary/40 shadow-[0_0_14px_-4px_var(--primary)]"
                      : s.tone === "accent"
                        ? "bg-accent/15 text-accent border border-accent/40 shadow-[0_0_14px_-4px_var(--accent)]"
                        : s.tone === "warn"
                          ? "bg-amber-400/10 text-amber-300 border border-amber-300/40"
                          : "bg-white/[0.05] text-foreground border border-white/10"
                  }`}
                >
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-background border border-border grid place-items-center text-[9px] font-mono">
                    {i + 1}
                  </span>
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug">{s.title}</p>
                  {s.detail && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">{s.detail}</p>
                  )}
                </div>
                {typeof s.meters === "number" && (
                  <span className="text-[10px] tabular-nums font-mono text-muted-foreground self-center">
                    {s.meters < 1 ? `${Math.round(s.meters * 100)}cm` : `${s.meters.toFixed(1)}m`}
                  </span>
                )}
              </li>
            ))}
      </ol>
    </div>
  );
}
