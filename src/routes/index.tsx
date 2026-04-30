import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ControlPanel } from "@/components/wayfinding/ControlPanel";
import { MapCanvas } from "@/components/wayfinding/MapCanvas";
import { BottomSheet } from "@/components/wayfinding/BottomSheet";
import { ReferenceBanner } from "@/components/wayfinding/ReferenceBanner";
import { POIS, buildRoute, findPoi, nearestPoi, routeLength } from "@/components/wayfinding/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atlas — Indoor Wayfinding System" },
      {
        name: "description",
        content:
          "Sistema de navegação interna ultra-moderno: mapas em glassmorphism, rotas otimizadas em tempo real e UX fluida.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [originId, setOriginId] = useState("entrance");
  const [destinationId, setDestinationId] = useState("r-1413");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(1);

  const origin = findPoi(originId);
  const destination = findPoi(destinationId);

  const { distance, duration } = useMemo(() => {
    const pts = buildRoute(origin, destination);
    const d = routeLength(pts);
    return { distance: d, duration: (d / 1.3) }; // ~1.3 m/s walking pace
  }, [origin, destination]);

  // Simulate route calculation when origin/destination change
  useEffect(() => {
    setLoading(true);
    setProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 0.18 + 0.08;
      if (p >= 1) {
        p = 1;
        clearInterval(interval);
        setProgress(1);
        setTimeout(() => setLoading(false), 220);
      } else {
        setProgress(p);
      }
    }, 110);
    return () => clearInterval(interval);
  }, [originId, destinationId]);

  function swap() {
    setOriginId(destinationId);
    setDestinationId(originId);
  }

  const reference = nearestPoi(destination, origin.id).name;

  const panel = (
    <ControlPanel
      origin={origin}
      destination={destination}
      onOriginChange={(id) => id !== destinationId && setOriginId(id)}
      onDestinationChange={(id) => id !== originId && setDestinationId(id)}
      onSwap={swap}
      distance={distance}
      duration={duration}
      loading={loading}
      progress={progress}
    />
  );

  return (
    <main className="relative h-dvh w-screen overflow-hidden">
      {/* Top brand bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center pt-4 lg:hidden">
        <div className="glass rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider">
          ATLAS · INDOOR NAV
        </div>
      </header>

      {/* Map */}
      <MapCanvas origin={origin} destination={destination} pois={POIS} loading={loading} />

      {/* Desktop floating panel */}
      <aside className="pointer-events-auto absolute left-6 top-6 z-30 hidden w-[360px] lg:block">
        <div className="mb-3 flex items-center gap-2 px-1">
          <div
            className="h-7 w-7 rounded-lg grid place-items-center text-[11px] font-black"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary-glow))",
              color: "var(--primary-foreground)",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            A
          </div>
          <h1 className="text-sm font-bold tracking-[0.18em]">ATLAS · INDOOR NAV</h1>
        </div>
        {panel}
      </aside>

      {/* Footer reference banner — desktop */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 hidden justify-center lg:flex">
        <ReferenceBanner name={reference} />
      </div>

      {/* Reference banner — mobile (above sheet) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[112px] z-30 flex justify-center lg:hidden px-4">
        <ReferenceBanner name={reference} />
      </div>

      {/* Mobile bottom sheet */}
      <BottomSheet>{panel}</BottomSheet>
    </main>
  );
}
