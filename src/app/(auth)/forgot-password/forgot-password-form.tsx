"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, LockKeyhole, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ShimmerButton } from "@/components/ui/shimmer-button";

const schema = z.object({
  email: z.string().email({ message: "Insira um email válido" }),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    setErrorMsg("");
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setErrorMsg(error.message);
        return;
      }
      setIsSuccess(true);
    });
  };

  if (isSuccess) {
    return (
      <div
        className="relative w-full max-w-[420px] border rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center gap-5"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(24px)", borderColor: "#1C1C1E" }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center border"
          style={{ background: "rgba(52,199,89,0.1)", borderColor: "rgba(52,199,89,0.2)" }}
        >
          <CheckCircle2 className="w-10 h-10" style={{ color: "#34C759" }} />
        </div>
        <h2 className="font-display text-4xl font-black" style={{ color: "#F2F2F7" }}>Link enviado!</h2>
        <p className="text-sm" style={{ color: "#8E8E93" }}>
          Verifique sua caixa de entrada. Enviamos um link seguro para você criar uma nova senha.
        </p>
        <Link
          href="/login"
          className="w-full h-[54px] rounded-full border flex items-center justify-center gap-2 font-semibold text-base transition-colors"
          style={{ background: "#1C1C1E", borderColor: "#2C2C2E", color: "#F2F2F7" }}
        >
          ← Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <div
      className="relative w-full max-w-[420px] border rounded-2xl shadow-2xl p-8 flex flex-col gap-6"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(24px)", borderColor: "#1C1C1E" }}
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
          <h1 className="font-display text-4xl font-black" style={{ color: "#F2F2F7" }}>Recuperar Acesso</h1>
          <p className="text-sm mt-1" style={{ color: "#8E8E93" }}>
            Digite seu e-mail cadastrado e enviaremos instruções para redefinir sua senha.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "#8E8E93" }}>
            E-mail
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#8E8E93" }} aria-hidden="true" />
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register("email")}
              className="w-full h-12 rounded-2xl pl-11 pr-4 text-sm outline-none border transition-colors"
              style={{ background: "#0F0F0F", borderColor: "#2C2C2E", color: "#F2F2F7" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#dc2626")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#2C2C2E")}
            />
          </div>
          {errors.email && (
            <span className="text-xs" style={{ color: "#FF3B30" }}>{errors.email.message}</span>
          )}
        </div>

        {errorMsg && (
          <p role="alert" className="text-xs text-center" style={{ color: "#FF3B30" }}>{errorMsg}</p>
        )}

        <ShimmerButton
          type="submit"
          disabled={isPending}
          className="w-full h-[54px] rounded-full mt-1"
          shimmerColor="#ffffff"
          shimmerSize="0.05em"
          style={{
            opacity: isPending ? 0.7 : 1,
          }}
        >
          <span className="flex items-center justify-center gap-2 text-center text-base font-semibold tracking-tight text-white relative z-10">
            {isPending ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> ENVIANDO...</>
            ) : (
              "ENVIAR LINK"
            )}
          </span>
        </ShimmerButton>
      </form>

      {/* Back link */}
      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm transition-colors"
          style={{ color: "#8E8E93" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
