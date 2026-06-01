"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/actions/auth";
import { toast } from "sonner";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Detecta erros do Supabase no hash da URL (ex: link de recuperação expirado)
    const hash = window.location.hash;
    if (hash.includes("error=")) {
      const params = new URLSearchParams(hash.replace("#", ""));
      const code = params.get("error_code");
      const desc = params.get("error_description");
      if (code === "otp_expired") {
        setUrlError("O link de recuperação expirou. Solicite um novo link abaixo.");
      } else if (desc) {
        setUrlError(decodeURIComponent(desc.replace(/\+/g, " ")));
      } else {
        setUrlError("Ocorreu um erro de autenticação. Tente novamente.");
      }
      // Limpa o hash da URL sem recarregar a página
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      const result = await signIn({ email, password });
      if (result.success && result.data) {
        toast.success("Login efetuado com sucesso!");
        router.push(result.data.redirectTo);
      } else {
        toast.error(result.error || "Falha ao efetuar login");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">

      {/* Banner de erro de URL (link expirado, etc.) */}
      {urlError && (
        <div
          role="alert"
          className="rounded-xl p-4 flex items-start gap-3 border"
          style={{ background: "rgba(255,59,48,0.08)", borderColor: "rgba(255,59,48,0.25)" }}
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#FF3B30" }} />
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: "#FF3B30" }}>{urlError}</p>
            <Link
              href="/forgot-password"
              className="text-xs mt-1 inline-block font-semibold underline-offset-2 underline"
              style={{ color: "#dc2626" }}
            >
              Solicitar novo link →
            </Link>
          </div>
        </div>
      )}

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "#8E8E93" }}>
          E-mail
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none" style={{ color: "#8E8E93" }} aria-hidden="true" />
          <input 
            id="email"
            type="email" 
            placeholder="seu@email.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isPending}
            className="w-full h-12 rounded-2xl pl-11 pr-4 text-sm outline-none transition-colors border"
            style={{ background: "#0F0F0F", borderColor: "#2C2C2E", color: "#F2F2F7" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#dc2626")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2C2C2E")}
          />
        </div>
      </div>
      
      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center ml-1 mr-1">
          <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8E8E93" }}>
            Senha
          </label>
          <Link href="/forgot-password" className="text-xs font-semibold transition-colors" style={{ color: "#dc2626" }}>
            Esqueceu?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none" style={{ color: "#8E8E93" }} aria-hidden="true" />
          <input 
            id="password"
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isPending}
            className="w-full h-12 rounded-2xl pl-11 pr-4 text-sm outline-none transition-colors border"
            style={{ background: "#0F0F0F", borderColor: "#2C2C2E", color: "#F2F2F7" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#dc2626")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2C2C2E")}
          />
        </div>
      </div>

      <ShimmerButton 
        type="submit" 
        disabled={isPending}
        className="w-full h-[54px] rounded-full mt-2"
        shimmerColor="#ffffff"
        shimmerSize="0.05em"
        style={{
          opacity: isPending ? 0.7 : 1,
        }}
      >
        <span className="flex items-center justify-center gap-2 text-center text-base font-semibold tracking-tight text-white relative z-10">
          {isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> ENTRANDO...</>
          ) : (
            "ENTRAR"
          )}
        </span>
      </ShimmerButton>
    </form>
  );
}
