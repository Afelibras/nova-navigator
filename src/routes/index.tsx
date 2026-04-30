import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ControlPanel } from "@/components/wayfinding/ControlPanel";
import { MapCanvas } from "@/components/wayfinding/MapCanvas";
import { BottomSheet } from "@/components/wayfinding/BottomSheet";
import { ReferenceBanner } from "@/components/wayfinding/ReferenceBanner";
import { RouteSteps } from "@/components/wayfinding/RouteSteps";
import { FLOORS } from "@/components/wayfinding/types";
import { useFavorites, type FavoriteRoute } from "@/hooks/use-favorites";
import { useAuth } from "@/hooks/use-auth";
import { useRoutePlan } from "@/hooks/use-route-plan";
import { usePois } from "@/hooks/use-pois";
import { findPoi, nearestPoi } from "@/components/wayfinding/types";

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
  const [originId, setOriginId] = useState("entrance-f1");
  const [destinationId, setDestinationId] = useState("r-3413-f3");
  const [currentFloor, setCurrentFloor] = useState<number>(1);
  const [navigationStarted, setNavigationStarted] = useState(false);

  const { user, token, loading: authLoading } = useAuth();
  const { pois, loading: poisLoading } = usePois();
  const { plan, loading: routeLoading, progress } = useRoutePlan(
    navigationStarted ? originId : "",
    navigationStarted ? destinationId : "",
    token,
  );
  const { favorites, isFavorite, toggle, remove, loading: favLoading } = useFavorites(
    user?.id ?? null,
    token,
  );

  const origin = pois.length > 0 ? findPoi(originId) : findPoi(originId);
  const destination = pois.length > 0 ? findPoi(destinationId) : findPoi(destinationId);

  useEffect(() => {
    setCurrentFloor(origin.floor);
  }, [origin.floor]);

  useEffect(() => {
    setNavigationStarted(false);
  }, [originId, destinationId]);

  function swap() {
    setOriginId(destinationId);
    setDestinationId(originId);
  }

  function handleStart() {
    setNavigationStarted(true);
  }

  const reference = nearestPoi(destination, origin.id)?.name ?? destination.name;

  async function checkIsFavorite(oid: string, did: string): Promise<boolean> {
    if (typeof isFavorite === "function") {
      return isFavorite(oid, did);
    }
    return favorites.some((f) => f.originId === oid && f.destinationId === did);
  }

  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    checkIsFavorite(originId, destinationId).then(setFavorited);
  }, [originId, destinationId, favorites]);

  async function onToggleFavorite() {
    const result = await toggle({
      originId,
      destinationId,
      label: `${origin.name} (${origin.floor}º) → ${destination.name} (${destination.floor}º)`,
    });
    if (result) {
      setFavorited(result.action === "added");
    }
  }

  function onSelectFavorite(f: FavoriteRoute) {
    setOriginId(f.originId);
    setDestinationId(f.destinationId);
    setNavigationStarted(true);
  }

  const loading = poisLoading || routeLoading || authLoading;

  const panel = (
    <ControlPanel
      origin={origin}
      destination={destination}
      onOriginChange={(id) => id !== destinationId && setOriginId(id)}
      onDestinationChange={(id) => id !== originId && setDestinationId(id)}
      onSwap={swap}
      onStart={handleStart}
      distance={plan?.distance ?? 0}
      duration={plan?.duration ?? 0}
      loading={loading}
      progress={progress}
      favorites={favorites}
      isFavorite={favorited}
      onToggleFavorite={onToggleFavorite}
      onSelectFavorite={onSelectFavorite}
      onRemoveFavorite={(id) => remove(id)}
    />
  );

  return (
    <main className="relative h-dvh w-screen overflow-hidden">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center pt-4 lg:hidden">
        <div className="glass rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider">
          ATLAS · ENG · 6 ANDARES
        </div>
      </header>

      <MapCanvas
        origin={origin}
        destination={destination}
        plan={navigationStarted ? plan : null}
        loading={loading && navigationStarted}
        floor={currentFloor}
        onFloorChange={setCurrentFloor}
        floors={FLOORS}
      />

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
          <h1 className="text-sm font-bold tracking-[0.18em]">ATLAS · ENGENHARIA</h1>
        </div>
        {panel}
        <div className="mt-3">
          <RouteSteps
            plan={navigationStarted ? plan : null}
            origin={origin}
            destination={destination}
            loading={loading && navigationStarted}
          />
        </div>
      </aside>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 hidden justify-center lg:flex">
        <ReferenceBanner name={reference} />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[112px] z-30 flex justify-center lg:hidden px-4">
        <ReferenceBanner name={reference} />
      </div>

      <BottomSheet>
        <div className="space-y-3">
          {panel}
          <RouteSteps
            plan={navigationStarted ? plan : null}
            origin={origin}
            destination={destination}
            loading={loading && navigationStarted}
          />
        </div>
      </BottomSheet>
    </main>
  );
}
