import { ArrowUpDown, MapPin, Navigation, Clock, Footprints, Sparkles, Star, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePois } from "@/hooks/use-pois";
import type { Poi } from "./types";
import { Button } from "@/components/ui/button";
import type { FavoriteRoute } from "@/hooks/use-favorites";

type Props = {
  origin: Poi;
  destination: Poi;
  onOriginChange: (id: string) => void;
  onDestinationChange: (id: string) => void;
  onSwap: () => void;
  onStart: () => void;
  distance: number;
  duration: number;
  loading: boolean;
  progress: number;
  favorites: FavoriteRoute[];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSelectFavorite: (fav: FavoriteRoute) => void;
  onRemoveFavorite: (id: string) => void;
};

export function ControlPanel({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onSwap,
  onStart,
  distance,
  duration,
  loading,
  progress,
  favorites,
  isFavorite,
  onToggleFavorite,
  onSelectFavorite,
  onRemoveFavorite,
}: Props) {
  const { pois } = usePois();
  const eta = formatDuration(duration);
  const dist = `${distance.toFixed(1)} m`;

  return (
    <div className="glass-strong rounded-2xl p-4 sm:p-5 w-full animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="relative h-9 w-9 rounded-xl grid place-items-center"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-glow))" }}
          >
            <Navigation className="h-4 w-4 text-primary-foreground" />
            <span className="absolute inset-0 rounded-xl animate-pulse-glow" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Wayfinding</p>
            <h2 className="text-sm font-semibold leading-none mt-0.5">Rota Inteligente</h2>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          AO VIVO
        </div>
      </div>

      {/* Origin / Destination */}
      <div className="relative space-y-2">
        <PoiSelect
          label="Origem"
          icon={<span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />}
          value={origin.id}
          pois={pois}
          onChange={onOriginChange}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={onSwap}
            className="h-9 w-9 rounded-full glass grid place-items-center hover:rotate-180 transition-transform duration-500"
            aria-label="Inverter origem e destino"
            title="Trocar sentido"
          >
            <ArrowUpDown className="h-4 w-4 text-primary" />
          </button>
        </div>
        <PoiSelect
          label="Destino"
          icon={<MapPin className="h-3 w-3 text-accent" />}
          value={destination.id}
          pois={pois}
          onChange={onDestinationChange}
        />
      </div>

      {/* Status card */}
      <div className="mt-4 rounded-xl border border-border bg-secondary/40 p-4">
        <div className="grid grid-cols-2 gap-3">
          <Stat
            icon={<Footprints className="h-4 w-4 text-primary" />}
            label="Distância"
            value={loading ? "—" : dist}
          />
          <Stat
            icon={<Clock className="h-4 w-4 text-accent" />}
            label="Tempo estimado"
            value={loading ? "—" : eta}
          />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-muted-foreground inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {loading ? "Otimizando trajeto…" : "Rota otimizada"}
            </span>
            <span className="font-mono text-foreground">{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full transition-[width] duration-300 ease-out"
              style={{
                width: `${Math.round(progress * 100)}%`,
                background: "linear-gradient(90deg, var(--primary), var(--primary-glow), var(--accent))",
                boxShadow: "0 0 12px oklch(0.78 0.18 250 / 0.6)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          onClick={onStart}
          className="flex-1 h-11 rounded-xl text-sm font-semibold border-0"
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary-glow))",
            boxShadow: "var(--shadow-glow)",
          }}
          disabled={loading}
        >
          <Navigation className="h-4 w-4 mr-2" />
          Iniciar Navegação
        </Button>
        <button
          onClick={onToggleFavorite}
          className={`h-11 w-11 rounded-xl grid place-items-center border transition-all ${
            isFavorite
              ? "border-accent/60 bg-accent/15 text-accent shadow-[0_0_18px_-4px_var(--accent)]"
              : "border-border bg-white/[0.03] text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
          }`}
          aria-label={isFavorite ? "Remover dos favoritos" : "Salvar como favorito"}
          title={isFavorite ? "Remover dos favoritos" : "Salvar rota"}
        >
          <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Favoritos */}
      {favorites.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground inline-flex items-center gap-1.5">
              <Star className="h-3 w-3 fill-accent text-accent" />
              Rotas favoritas
            </p>
            <span className="text-[10px] text-muted-foreground tabular-nums">{favorites.length}/12</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1 scrollbar-none">
            {favorites.map((f) => (
              <div
                key={f.id}
                className="group inline-flex items-center gap-1 rounded-full border border-border bg-white/[0.04] hover:bg-white/[0.08] transition-colors pl-2 pr-1 py-1 text-[11px]"
              >
                <button
                  onClick={() => onSelectFavorite(f)}
                  className="inline-flex items-center gap-1 max-w-[180px] truncate"
                  title={f.label}
                >
                  <Navigation className="h-3 w-3 text-primary shrink-0" />
                  <span className="truncate">{f.label}</span>
                </button>
                <button
                  onClick={() => onRemoveFavorite(f.id)}
                  className="h-5 w-5 rounded-full grid place-items-center text-muted-foreground hover:text-destructive hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remover favorito"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-xl font-bold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}

function PoiSelect({
  label,
  icon,
  value,
  pois,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  pois: Poi[];
  onChange: (v: string) => void;
}) {
  const selected = pois.find((x) => x.id === value);
  const floors = [...new Set(pois.map((p) => p.floor))].sort((a, b) => a - b);

  return (
    <div className="rounded-xl border border-border bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
      <div className="px-3 pt-2 pb-0 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        <span className="grid h-4 w-4 place-items-center">{icon}</span>
        {label}
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          aria-label={label}
          className="bg-transparent border-0 h-11 pl-3 pr-12 text-sm font-medium focus:ring-0 focus:ring-offset-0 shadow-none"
        >
          <SelectValue>
            {selected ? (
              <span className="inline-flex items-center gap-2">
                <Dot type={selected.type} />
                <span>{selected.name}</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {selected.floor}º andar
                </span>
              </span>
            ) : (
              "Selecione…"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="glass-strong border-border max-h-[320px]">
          {floors.map((floor) => {
            const items = pois.filter((p) => p.floor === floor);
            if (items.length === 0) return null;
            return (
              <div key={floor}>
                <div className="px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground sticky top-0 bg-popover/80 backdrop-blur">
                  {floor}º andar
                </div>
                {items.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-sm">
                    <span className="inline-flex items-center gap-2">
                      <Dot type={p.type} />
                      {p.name}
                    </span>
                  </SelectItem>
                ))}
              </div>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

function Dot({ type }: { type: Poi["type"] }) {
  const color: Record<Poi["type"], string> = {
    elevator: "var(--primary)",
    stairs: "var(--primary-glow)",
    room: "var(--accent)",
    entrance: "var(--accent-glow)",
    exit: "oklch(0.72 0.20 30)",
    restroom: "oklch(0.78 0.10 220)",
    "restroom-female": "oklch(0.72 0.18 330)",
    "restroom-male": "oklch(0.72 0.15 240)",
    cafe: "oklch(0.80 0.14 60)",
  };
  return (
    <span
      className="h-2 w-2 rounded-full shrink-0"
      style={{ background: color[type], boxShadow: `0 0 8px ${color[type]}` }}
    />
  );
}

function formatDuration(seconds: number) {
  if (!isFinite(seconds) || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}min ${s.toString().padStart(2, "0")}s`;
}
