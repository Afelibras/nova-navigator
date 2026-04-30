import { useEffect, useState } from "react";
import { planRouteServer } from "@/server/routing";
import type { RoutePlan } from "@/shared/types";

export function useRoutePlan(originId: string, destinationId: string, token: string | null) {
  const [plan, setPlan] = useState<RoutePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!originId || !destinationId) {
      setPlan(null);
      setLoading(false);
      setProgress(0);
      setError(null);
      return;
    }

    setLoading(true);
    setProgress(0);
    setError(null);

    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 0.18 + 0.08;
        return next >= 1 ? 1 : next;
      });
    }, 110);

    planRouteServer({ data: { originId, destinationId } })
      .then((data) => {
        setPlan(data);
        setProgress(1);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to plan route");
      })
      .finally(() => {
        clearInterval(interval);
        setTimeout(() => setLoading(false), 220);
      });

    return () => clearInterval(interval);
  }, [originId, destinationId, token]);

  return { plan, loading, progress, error };
}
