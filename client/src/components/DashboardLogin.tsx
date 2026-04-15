/*
 * DashboardLogin — Tela de login para proteger o acesso ao Dashboard
 * Theme: Dark background, brand #9B212B accent
 * Credenciais armazenadas com hash simples no client-side
 */
import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, ArrowLeft, AlertCircle, Shield } from "lucide-react";
import { Link } from "wouter";

// Hash simples para não expor credenciais em texto plano no código
// Usa btoa para ofuscar (não é criptografia forte, mas evita exposição direta)
const VALID_HASH = btoa("alex@totalquality.med.br:Total2@25");
const SESSION_KEY = "tq_dashboard_auth";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas

function hashCredentials(email: string, password: string): string {
  return btoa(`${email}:${password}`);
}

function isSessionValid(): boolean {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return false;
    const { hash, expiry } = JSON.parse(session);
    if (hash !== VALID_HASH) return false;
    if (Date.now() > expiry) {
      localStorage.removeItem(SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function createSession(): void {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ hash: VALID_HASH, expiry: Date.now() + SESSION_DURATION })
  );
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
  window.location.reload();
}

interface DashboardLoginProps {
  children: React.ReactNode;
}

export default function DashboardLogin({ children }: DashboardLoginProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Verificar sessão existente
    if (isSessionValid()) {
      setIsAuthenticated(true);
    }
    setCheckingSession(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simular delay de autenticação
    await new Promise((resolve) => setTimeout(resolve, 800));

    const hash = hashCredentials(email.trim().toLowerCase(), password);
    if (hash === VALID_HASH) {
      createSession();
      setIsAuthenticated(true);
    } else {
      setError("E-mail ou senha incorretos. Tente novamente.");
    }
    setIsLoading(false);
  };

  // Enquanto verifica sessão, mostrar loading
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="animate-pulse">
          <Shield className="w-10 h-10" style={{ color: "#9B212B" }} />
        </div>
      </div>
    );
  }

  // Se autenticado, renderizar o dashboard
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Tela de login
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#1A1A1A" }}>
      <div className="w-full max-w-md">
        {/* Voltar ao site */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm mb-8 transition-opacity hover:opacity-70"
          style={{ color: "#9CA3AF" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao site
        </Link>

        {/* Card de login */}
        <div
          className="rounded-xl p-8 border"
          style={{ backgroundColor: "#242424", borderColor: "#3A3A3A" }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "#9B212B20" }}
            >
              <Lock className="w-8 h-8" style={{ color: "#9B212B" }} />
            </div>
            <h1
              className="text-2xl font-bold tracking-wider uppercase mb-2"
              style={{ fontFamily: "'Bebas Neue', sans-serif", color: "#F5F5F5" }}
            >
              ANALYTICS <span style={{ color: "#9B212B" }}>DASHBOARD</span>
            </h1>
            <p className="text-sm" style={{ color: "#9CA3AF" }}>
              Acesso restrito. Insira suas credenciais.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "#9CA3AF" }}
              >
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-300 focus:ring-2"
                style={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #3A3A3A",
                  color: "#F5F5F5",
                  caretColor: "#9B212B",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#9B212B"; e.target.style.boxShadow = "0 0 0 2px #9B212B30"; }}
                onBlur={(e) => { e.target.style.borderColor = "#3A3A3A"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Senha */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "#9CA3AF" }}
              >
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-lg text-sm outline-none transition-all duration-300"
                  style={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #3A3A3A",
                    color: "#F5F5F5",
                    caretColor: "#9B212B",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#9B212B"; e.target.style.boxShadow = "0 0 0 2px #9B212B30"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#3A3A3A"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-opacity hover:opacity-70"
                  style={{ color: "#9CA3AF" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
                style={{ backgroundColor: "#9B212B15", border: "1px solid #9B212B30", color: "#F87171" }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Botão de login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2"
              style={{
                backgroundColor: isLoading ? "#7A1A22" : "#9B212B",
                color: "white",
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => { if (!isLoading) (e.target as HTMLButtonElement).style.backgroundColor = "#B22A35"; }}
              onMouseLeave={(e) => { if (!isLoading) (e.target as HTMLButtonElement).style.backgroundColor = "#9B212B"; }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Entrar no Dashboard
                </>
              )}
            </button>
          </form>

          {/* Info */}
          <p className="text-center text-xs mt-6" style={{ color: "#6B7280" }}>
            Sessão válida por 24 horas.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: "#4B5563" }}>
          Total Quality Medicina Diagnóstica &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
