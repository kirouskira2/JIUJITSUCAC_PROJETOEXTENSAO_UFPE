import { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Recuperar Senha | JJCAC",
  description: "Recupere o acesso à sua conta do Tatame Digital.",
};

export default function ForgotPasswordPage() {
  return (
    <div 
      className="w-full max-w-[420px] mx-auto border rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 relative z-10 overflow-hidden"
      style={{
        background: "#000000",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderColor: "#1C1C1E",
      }}
    >
      <ForgotPasswordForm />
    </div>
  );
}
