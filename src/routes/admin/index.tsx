import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getStats, getPopularRoutes } from "@/server/analytics";
import { getAllPois, deletePoiServer } from "@/server/pois";
import { Navigation, BarChart3, Users, Star, MapPin, LogOut, ArrowLeft, Trash2, Building } from "lucide-react";
import type { Poi, PoiType } from "@/shared/types";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Admin — Atlas" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [popularRoutes, setPopularRoutes] = useState<{ route: string; count: number }[]>([]);
  const [pois, setPois] = useState<Poi[]>([]);
  const [filterFloor, setFilterFloor] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<PoiType | null>(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.navigate({ to: "/" });
      return;
    }

    getStats({}).then(setStats);
    getPopularRoutes({ data: { limit: 10 } }).then(setPopularRoutes);
    getAllPois({}).then(setPois);
  }, [user, router]);

  async function handleDeletePoi(id: string) {
    if (!token || !user) return;
    if (!confirm("Tem certeza que deseja excluir este POI?")) return;
    try {
      await deletePoiServer({ data: { id, adminToken: token } });
      setPois((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function handleLogout() {
    await logout();
    router.navigate({ to: "/" });
  }

  const filteredPois = pois.filter((p) => {
    if (filterFloor && p.floor !== filterFloor) return false;
    if (filterType && p.type !== filterType) return false;
    return true;
  });

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-dvh bg-background">
      <header className="glass-strong border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="h-9 w-9 rounded-lg grid place-items-center hover:bg-white/5">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-lg grid place-items-center"
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--primary-glow))",
                }}
              >
                <Navigation className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-sm font-bold tracking-[0.18em]">ATLAS · ADMIN</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{user.name}</span>
            <button
              onClick={handleLogout}
              className="h-8 px-3 rounded-lg text-xs flex items-center gap-1 hover:bg-white/5"
            >
              <LogOut className="h-3 w-3" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<MapPin className="h-5 w-5" />}
            label="Total de POIs"
            value={stats?.totalPois ?? 0}
            color="var(--primary)"
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Usuários"
            value={stats?.totalUsers ?? 0}
            color="var(--accent)"
          />
          <StatCard
            icon={<Star className="h-5 w-5" />}
            label="Favoritos"
            value={stats?.totalFavorites ?? 0}
            color="oklch(0.80 0.14 60)"
          />
          <StatCard
            icon={<BarChart3 className="h-5 w-5" />}
            label="Rotas Planejadas"
            value={stats?.totalRouteRequests ?? 0}
            color="oklch(0.72 0.20 30)"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-strong rounded-2xl p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Rotas Mais Populares
            </h2>
            {popularRoutes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma rota registrada ainda</p>
            ) : (
              <div className="space-y-2">
                {popularRoutes.map((r, i) => (
                  <div
                    key={r.route}
                    className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-border px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full grid place-items-center text-[10px] font-bold"
                        style={{
                          background: "linear-gradient(135deg, var(--primary), var(--primary-glow))",
                          color: "var(--primary-foreground)",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className="font-mono text-xs truncate max-w-[200px]">{r.route}</span>
                    </div>
                    <span className="text-xs font-semibold tabular-nums">{r.count}x</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-strong rounded-2xl p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              Andares
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((f) => {
                const count = pois.filter((p) => p.floor === f).length;
                return (
                  <button
                    key={f}
                    onClick={() => setFilterFloor(filterFloor === f ? null : f)}
                    className={`rounded-xl border px-3 py-4 text-center transition-colors ${
                      filterFloor === f
                        ? "border-primary bg-primary/10"
                        : "border-border bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}
                  >
                    <p className="text-lg font-bold">{f}º</p>
                    <p className="text-[10px] text-muted-foreground">{count} POIs</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Gerenciar POIs
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={filterType ?? ""}
                onChange={(e) => setFilterType(e.target.value ? e.target.value as PoiType : null)}
                className="rounded-lg border border-border bg-white/[0.03] text-xs px-2 py-1.5"
              >
                <option value="">Todos os tipos</option>
                <option value="room">Salas</option>
                <option value="elevator">Elevadores</option>
                <option value="stairs">Escadas</option>
                <option value="restroom">Banheiros</option>
                <option value="entrance">Entradas</option>
                <option value="exit">Saídas</option>
                <option value="cafe">Café</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-[10px] uppercase tracking-wider">
                  <th className="text-left py-2 px-2">ID</th>
                  <th className="text-left py-2 px-2">Nome</th>
                  <th className="text-left py-2 px-2">Tipo</th>
                  <th className="text-left py-2 px-2">Andar</th>
                  <th className="text-left py-2 px-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPois.slice(0, 50).map((poi) => (
                  <tr key={poi.id} className="border-b border-border/50 hover:bg-white/[0.02]">
                    <td className="py-2 px-2 font-mono text-xs truncate max-w-[150px]">{poi.id}</td>
                    <td className="py-2 px-2">{poi.name}</td>
                    <td className="py-2 px-2">
                      <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[10px]">
                        {poi.type}
                      </span>
                    </td>
                    <td className="py-2 px-2">{poi.floor}º</td>
                    <td className="py-2 px-2">
                      <button
                        onClick={() => handleDeletePoi(poi.id)}
                        className="h-7 w-7 rounded-lg grid place-items-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPois.length > 50 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Mostrando 50 de {filteredPois.length} POIs
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="glass-strong rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="h-8 w-8 rounded-lg grid place-items-center"
          style={{ background: `${color}20`, color }}
        >
          {icon}
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value.toLocaleString()}</p>
    </div>
  );
}
