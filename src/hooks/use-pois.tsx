import { useEffect, useState } from "react";
import { getAllPois, getPoiById, getPoisByFloor, searchPois } from "@/server/pois";
import type { Poi } from "@/shared/types";

export function usePois() {
  const [pois, setPois] = useState<Poi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllPois({})
      .then((data) => {
        setPois(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load POIs");
      })
      .finally(() => setLoading(false));
  }, []);

  const refetch = async () => {
    setLoading(true);
    try {
      const data = await getAllPois({});
      setPois(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load POIs");
    } finally {
      setLoading(false);
    }
  };

  return { pois, loading, error, refetch };
}

export function usePoi(id: string) {
  const [poi, setPoi] = useState<Poi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getPoiById({ data: id })
      .then((data) => {
        setPoi(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load POI");
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { poi, loading, error };
}

export function usePoisByFloor(floor: number) {
  const [pois, setPois] = useState<Poi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPoisByFloor({ data: floor })
      .then((data) => {
        setPois(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load POIs");
      })
      .finally(() => setLoading(false));
  }, [floor]);

  return { pois, loading, error };
}

export function useSearchPois(query: string) {
  const [results, setResults] = useState<Poi[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    searchPois({ data: query })
      .then((data) => setResults(data))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query]);

  return { results, loading };
}
