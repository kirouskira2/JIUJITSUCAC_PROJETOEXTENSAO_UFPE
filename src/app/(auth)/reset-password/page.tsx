"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { LockKeyhole, Eye, EyeOff, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  // O Supabase redireciona com #access_token na URL.
  // Precisamos escutar o evento SIGNED_IN que o cliente processa automaticamente.
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setSessionReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const inputStyle = {
    background: "#0F0F0F",
    borderColor: "#2C2C2E",
    color: "#F2F2F7",
  };

  const passwordStrength = (() => {
    if (!password) return { label: "", color: "#2C2C2E", width: "0%" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    const map = [
      { label: "Muito fraca", color: "#FF3B30", width: "25%" },
      { label: "Fraca", color: "#FF9F0A", width: "50%" },
      { label: "Boa", color: "#FFD60A", width: "75%" },
      { label: "Forte", color: "#34C759", width: "100%" },
    ];
    return map[score - 1] || map[0];
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirm) {
      setErrorMsg("As senhas não coincidem.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErrorMsg(error.message);
        return;
      }
      setSuccess(true);
      toast.success("Senha atualizada com sucesso!");
      setTimeout(() => router.push("/login"), 3000);
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#050505" }}>
        <div
          className="w-full max-w-[420px] border rounded-2xl p-8 flex flex-col items-center text-center gap-6 shadow-2xl"
          style={{ background: "#000000", borderColor: "#1C1C1E" }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center border"
            style={{ background: "rgba(52,199,89,0.1)", borderColor: "rgba(52,199,89,0.2)" }}
          >
            <CheckCircle2 className="w-10 h-10" style={{ color: "#34C759" }} />
          </div>
          <div>
            <h1 className="font-display text-4xl font-black" style={{ color: "#F2F2F7" }}>
              Senha Atualizada!
            </h1>
            <p className="text-sm mt-2" style={{ color: "#8E8E93" }}>
              Sua nova senha foi salva. Você será redirecionado para o login em instantes.
            </p>
          </div>
          <Link
            href="/login"
            className="w-full h-[54px] rounded-full border flex items-center justify-center gap-2 font-semibold text-base transition-colors"
            style={{ background: "#1C1C1E", borderColor: "#2C2C2E", color: "#F2F2F7" }}
          >
            Ir para o Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#050505" }}>
      <div
        className="w-full max-w-[420px] border rounded-2xl p-8 flex flex-col gap-6 shadow-2xl"
        style={{ background: "#000000", borderColor: "#1C1C1E" }}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center border"
            style={{ background: "rgba(220,38,38,0.1)", borderColor: "rgba(220,38,38,0.2)" }}
          >
            <LockKeyhole className="w-8 h-8" style={{ color: "#dc2626" }} />
          </div>
          <div>
            <h1 className="font-display text-4xl font-black" style={{ color: "#F2F2F7" }}>
              Nova Senha
            </h1>
            <p className="text-sm mt-1" style={{ color: "#8E8E93" }}>
              Escolha uma senha segura para proteger sua conta.
            </p>
          </div>
        </div>

        {!sessionReady && (
          <div
            className="rounded-xl p-4 flex items-start gap-3 border"
            style={{ background: "rgba(255,159,10,0.08)", borderColor: "rgba(255,159,10,0.2)" }}
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#FF9F0A" }} />
            <p className="text-sm" style={{ color: "#FF9F0A" }}>
              Carregando sessão segura... Se demorar, tente reabrir o link do e-mail.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nova senha */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "#8E8E93" }}>
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isPending || !sessionReady}
                className="w-full h-12 rounded-2xl px-4 pr-11 text-sm outline-none border transition-colors"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#dc2626")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2C2C2E")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: "#8E8E93" }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Barra de força */}
            {password && (
              <div className="flex flex-col gap-1 mt-1">
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "#2C2C2E" }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: passwordStrength.width, background: passwordStrength.color }}
                  />
                </div>
                <span className="text-xs ml-1" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirmar senha */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "#8E8E93" }}>
              Confirmar Senha
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                disabled={isPending || !sessionReady}
                className="w-full h-12 rounded-2xl px-4 pr-11 text-sm outline-none border transition-colors"
                style={{
                  ...inputStyle,
                  borderColor: confirm && confirm !== password ? "#FF3B30" : "#2C2C2E",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = confirm !== password ? "#FF3B30" : "#dc2626";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = confirm && confirm !== password ? "#FF3B30" : "#2C2C2E";
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: "#8E8E93" }}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirm && confirm !== password && (
              <span className="text-xs ml-1" style={{ color: "#FF3B30" }}>
                As senhas não coincidem
              </span>
            )}
          </div>

          {errorMsg && (
            <p className="text-xs text-center px-2 py-2 rounded-xl" style={{ color: "#FF3B30", background: "rgba(255,59,48,0.08)" }}>
              {errorMsg}
            </p>
          )}

          <ShimmerButton
            type="submit"
            disabled={isPending || !sessionReady || !password || password !== confirm}
            className="w-full h-[54px] rounded-full mt-1"
            shimmerColor="#ffffff"
            shimmerSize="0.05em"
            style={{ opacity: (isPending || !sessionReady || !password || password !== confirm) ? 0.5 : 1 }}
          >
            <span className="flex items-center justify-center gap-2 text-center text-base font-semibold tracking-tight text-white relative z-10">
              {isPending ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> SALVANDO...</>
              ) : (
                "SALVAR NOVA SENHA"
              )}
            </span>
          </ShimmerButton>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm transition-colors"
            style={{ color: "#8E8E93" }}
          >
            ← Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
}
