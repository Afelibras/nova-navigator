import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navigation, Mail, Lock, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [{ title: "Login — Atlas" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      router.navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="glass-strong rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-center mb-6">
            <div
              className="h-12 w-12 rounded-xl grid place-items-center"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary-glow))",
              }}
            >
              <Navigation className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-1">Login</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Acesse sua conta para salvar rotas favoritas
          </p>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-white/[0.03] text-sm focus:outline-none focus:border-primary"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-white/[0.03] text-sm focus:outline-none focus:border-primary"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl text-sm font-semibold border-0 text-primary-foreground disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary-glow))",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              {submitting ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/auth/register"
              className="text-sm text-primary hover:underline"
            >
              Não tem conta? Registre-se
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Demo: admin@localiza.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
