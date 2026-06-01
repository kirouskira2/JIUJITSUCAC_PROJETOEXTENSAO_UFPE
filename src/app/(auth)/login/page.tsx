import { redirect } from "next/navigation";
import { getSession } from "@/actions/auth";
import { LoginForm } from "./login-form";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

const BorderBeam = dynamic(() => import("@/components/ui/border-beam").then(mod => mod.BorderBeam), { ssr: false });

export default async function LoginPage() {
  const { data } = await getSession();

  if (data?.session) {
    const role = data.profile?.role;
    if (role === "admin") redirect("/admin");
    if (role === "monitor") redirect("/monitor");
    redirect("/aluno");
  }

  return (
    <div
      className="w-full max-w-[420px] mx-auto border rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 relative z-10 overflow-hidden"
      style={{
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderColor: "#1C1C1E",
      }}
    >
      <BorderBeam size={250} duration={25} delay={9} colorFrom="#dc2626" colorTo="#ff4d4d" />
      {/* Header */}
      <div className="flex flex-col items-center gap-3 mb-2">
        <div
          className="w-28 h-28 rounded-full p-0.5 border-2 shadow-lg"
          style={{ borderColor: "#dc2626" }}
        >
          <Image
            src="/logo.jpg?v=2"
            alt="JJCAC Logo"
            width={112}
            height={112}
            priority
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div className="text-center">
          <h1
            className="font-display text-4xl font-black uppercase tracking-tighter"
            style={{ color: "#dc2626" }}
          >
            Jiu-Jitsu para Todos
          </h1>
          <p className="text-sm mt-1" style={{ color: "#8E8E93" }}>
            Acesse sua conta para continuar
          </p>
        </div>
      </div>

      <LoginForm />

      <div className="text-center">
        <p className="text-sm" style={{ color: "#8E8E93" }}>
          Ainda não tem conta?{" "}
          <Link
            href="/signup"
            className="font-semibold transition-colors"
            style={{ color: "#dc2626" }}
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
