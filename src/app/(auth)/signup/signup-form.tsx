"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/actions/auth";
import { toast } from "sonner";
import { User, Verified, GraduationCap, Calendar, Loader2 } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export function SignupForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [userProfile, setUserProfile] = useState<"professor" | "aluno" | "extensionista">("extensionista");
  const [inviteCode, setInviteCode] = useState("");
  const [institution, setInstitution] = useState("");
  const [goalHours, setGoalHours] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [ufpeBond, setUfpeBond] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [sexualOrientation, setSexualOrientation] = useState("");
  const [genderIdentity, setGenderIdentity] = useState("");
  const [race, setRace] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  /** Aplica máscara de CPF: XXX.XXX.XXX-XX */
  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!fullName || !email || !password) {
        toast.error("Preencha nome, email e senha para continuar.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (userProfile === "professor" && !inviteCode) {
        toast.error("Insira o código de convite.");
        return;
      }
      if (userProfile === "extensionista" && (!institution || !goalHours)) {
        toast.error("Preencha a instituição e meta de horas.");
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await signUp({ 
        email, password, fullName,
        cpf: cpf.replace(/\D/g, "") || undefined,
        userProfile,
        inviteCode: inviteCode || undefined,
        institution: institution || undefined,
        goalHours: goalHours || undefined,
        phone: phone || undefined,
        emergencyContact: emergencyContact || undefined,
        ufpeBond: ufpeBond || undefined,
        academicLevel: academicLevel || undefined,
        sexualOrientation: sexualOrientation || undefined,
        genderIdentity: genderIdentity || undefined,
        race: race || undefined,
      });
      if (result.success) {
        toast.success("Conta criada com sucesso! Faça o login agora.");
        router.push("/login");
      } else {
        toast.error(result.error || "Falha ao criar conta");
      }
    });
  };

  const inputStyle = { background: "#0F0F0F", borderColor: "#2C2C2E", color: "#F2F2F7" };

  const ProfileOption = ({
    value, label, desc, icon: Icon, active,
  }: {
    value: string; label: string; desc: string; icon: React.ComponentType<{className?: string; style?: React.CSSProperties}>; active: boolean;
  }) => (
    <label
      className="relative flex flex-col p-4 rounded-xl border cursor-pointer transition-all"
      style={{
        background: active ? "rgba(220,38,38,0.06)" : "#111111",
        borderColor: active ? "#dc2626" : "#2C2C2E",
      }}
    >
      <input className="sr-only" name="user_profile" type="radio" value={value}
        checked={active} onChange={() => setUserProfile(value as typeof userProfile)} />
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-sm" style={{ color: "#F2F2F7" }}>{label}</span>
        <Icon className="w-5 h-5" style={{ color: active ? "#dc2626" : "#8E8E93" }} />
      </div>
      <p className="text-xs" style={{ color: "#8E8E93" }}>{desc}</p>
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Indicador de progresso */}
      <div className="flex gap-2 mb-2">
        <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-red-600" : "bg-[#2C2C2E]"}`} />
        <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-red-600" : "bg-[#2C2C2E]"}`} />
        <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 3 ? "bg-red-600" : "bg-[#2C2C2E]"}`} />
      </div>

      {step === 1 && (
        <>
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-white">Criar Conta</h3>
            <p className="text-sm" style={{ color: "#8E8E93" }}>Seus dados básicos de acesso.</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "#8E8E93" }}>Nome Completo</label>
              <input id="fullName" type="text" placeholder="Seu nome completo" value={fullName}
                onChange={(e) => setFullName(e.target.value)} required disabled={isPending}
                className="w-full h-12 rounded-2xl px-4 text-sm outline-none border transition-colors" style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#dc2626")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2C2C2E")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "#8E8E93" }}>Email</label>
              <input id="email" type="email" placeholder="seu@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required disabled={isPending}
                className="w-full h-12 rounded-2xl px-4 text-sm outline-none border transition-colors" style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#dc2626")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2C2C2E")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "#8E8E93" }}>Senha</label>
              <input id="password" type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required disabled={isPending}
                className="w-full h-12 rounded-2xl px-4 text-sm outline-none border transition-colors" style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#dc2626")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2C2C2E")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cpf" className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "#8E8E93" }}>CPF</label>
              <input id="cpf" type="text" placeholder="000.000.000-00" value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))} disabled={isPending}
                inputMode="numeric"
                className="w-full h-12 rounded-2xl px-4 text-sm outline-none border transition-colors" style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#dc2626")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2C2C2E")}
              />
              <span className="text-xs ml-1" style={{ color: "#636366" }}>Obrigatório para extensionistas</span>
            </div>
          </div>

          <ShimmerButton 
            type="button" 
            onClick={handleNextStep}
            className="w-full h-[54px] rounded-full mt-4"
            shimmerColor="#ffffff"
            shimmerSize="0.05em"
            aria-label="Avançar para o próximo passo"
          >
            <span className="flex items-center justify-center gap-2 text-center text-base font-semibold tracking-tight text-white relative z-10">
              PRÓXIMO
            </span>
          </ShimmerButton>
        </>
      )}

      {step === 2 && (
        <>
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-white">Perfil no Projeto</h3>
            <p className="text-sm" style={{ color: "#8E8E93" }}>Como você participa do Jiu-Jitsu para Todos?</p>
          </div>
          
          <div className="flex flex-col gap-2">
            <ProfileOption value="extensionista" label="Aluno Extensionista" desc="Rastreamento de horas de extensão." icon={GraduationCap} active={userProfile === "extensionista"} />
            <ProfileOption value="aluno" label="Aluno" desc="Perfil do aluno e scanner de presença." icon={User} active={userProfile === "aluno"} />
            <ProfileOption value="professor" label="Professor / Admin" desc="Painel administrativo e gestão." icon={Verified} active={userProfile === "professor"} />
          </div>

          {userProfile === "professor" && (
            <div className="flex flex-col gap-1.5 mt-2">
              <label htmlFor="inviteCode" className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "#8E8E93" }}>Código de Convite</label>
              <input id="inviteCode" type="text" placeholder="Insira o código de segurança" value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)} required
                className="w-full h-12 rounded-2xl px-4 text-sm outline-none border transition-colors" style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#dc2626")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2C2C2E")}
              />
            </div>
          )}

          {userProfile === "extensionista" && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="institution" className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "#8E8E93" }}>Instituição</label>
                <input id="institution" type="text" placeholder="Universidade" value={institution}
                  onChange={(e) => setInstitution(e.target.value)} required
                  className="w-full h-12 rounded-2xl px-4 text-sm outline-none border transition-colors" style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#dc2626")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2C2C2E")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="goalHours" className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "#8E8E93" }}>Meta (horas)</label>
                <input id="goalHours" type="number" placeholder="Ex: 20" value={goalHours}
                  onChange={(e) => setGoalHours(e.target.value)} required
                  className="w-full h-12 rounded-2xl px-4 text-sm outline-none border transition-colors" style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#dc2626")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2C2C2E")}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button 
              type="button"
              onClick={() => setStep(1)}
              className="w-1/3 h-[54px] rounded-full border text-sm font-semibold tracking-tight transition-colors"
              aria-label="Voltar para o passo anterior"
              style={{ borderColor: "#2C2C2E", color: "#8E8E93", background: "transparent" }}
            >
              VOLTAR
            </button>
            <ShimmerButton 
              type="button" 
              onClick={handleNextStep}
              className="w-2/3 h-[54px] rounded-full"
              shimmerColor="#ffffff"
              shimmerSize="0.05em"
              aria-label="Avançar para o próximo passo"
            >
              <span className="flex items-center justify-center gap-2 text-center text-base font-semibold tracking-tight text-white relative z-10">
                PRÓXIMO
              </span>
            </ShimmerButton>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-white">Mais sobre você</h3>
            <p className="text-sm" style={{ color: "#8E8E93" }}>Dados estatísticos para os relatórios da UFPE.</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "#8E8E93" }}>Celular / Whats</label>
                <input id="phone" type="text" placeholder="(DD) 9XXXX-XXXX" value={phone}
                  onChange={(e) => setPhone(e.target.value)} required disabled={isPending}
                  className="w-full h-12 rounded-2xl px-4 text-sm outline-none border transition-colors" style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#dc2626")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2C2C2E")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="emergencyContact" className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "#8E8E93" }}>Emergência</label>
                <input id="emergencyContact" type="text" placeholder="(DD) 9XXXX-XXXX" value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)} required disabled={isPending}
                  className="w-full h-12 rounded-2xl px-4 text-sm outline-none border transition-colors" style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#dc2626")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2C2C2E")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="ufpeBond" className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "#8E8E93" }}>Vínculo com a UFPE</label>
              <select id="ufpeBond" value={ufpeBond} onChange={(e) => setUfpeBond(e.target.value)} required disabled={isPending}
                className="w-full h-12 rounded-2xl px-4 text-sm outline-none border transition-colors appearance-none"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#dc2626")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2C2C2E")}
              >
                <option disabled value="" style={{ color: "#48484A" }}>Selecione</option>
                <option value="Estudante UFPE">Estudante UFPE</option>
                <option value="Servidor UFPE">Servidor UFPE</option>
                <option value="Comunidade Externa">Comunidade Externa</option>
              </select>
            </div>

            {ufpeBond === "Estudante UFPE" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="academicLevel" className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "#8E8E93" }}>Nível Acadêmico</label>
                <select id="academicLevel" value={academicLevel} onChange={(e) => setAcademicLevel(e.target.value)} required disabled={isPending}
                  className="w-full h-12 rounded-2xl px-4 text-sm outline-none border transition-colors appearance-none"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#dc2626")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2C2C2E")}
                >
                  <option disabled value="" style={{ color: "#48484A" }}>Selecione</option>
                  <option value="Graduação">Graduação</option>
                  <option value="Mestrado">Mestrado</option>
                  <option value="Doutorado">Doutorado</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="genderIdentity" className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "#8E8E93" }}>Ident. Gênero</label>
                <select id="genderIdentity" value={genderIdentity} onChange={(e) => setGenderIdentity(e.target.value)} required disabled={isPending}
                  className="w-full h-12 rounded-2xl px-4 text-sm outline-none border transition-colors appearance-none"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#dc2626")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2C2C2E")}
                >
                  <option disabled value="" style={{ color: "#48484A" }}>Selecione</option>
                  <option value="Homem Cisgênero">Homem Cis</option>
                  <option value="Mulher Cisgênero">Mulher Cis</option>
                  <option value="Homem Trans">Homem Trans</option>
                  <option value="Mulher Trans">Mulher Trans</option>
                  <option value="Não-binário">Não-binário</option>
                  <option value="Outro">Outro</option>
                  <option value="Prefiro não informar">Prefiro não informar</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sexualOrientation" className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "#8E8E93" }}>Orient. Sexual</label>
                <select id="sexualOrientation" value={sexualOrientation} onChange={(e) => setSexualOrientation(e.target.value)} required disabled={isPending}
                  className="w-full h-12 rounded-2xl px-4 text-sm outline-none border transition-colors appearance-none"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#dc2626")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2C2C2E")}
                >
                  <option disabled value="" style={{ color: "#48484A" }}>Selecione</option>
                  <option value="Heterossexual">Heterossexual</option>
                  <option value="Bissexual">Bissexual</option>
                  <option value="Homossexual">Homossexual</option>
                  <option value="Lésbica">Lésbica</option>
                  <option value="Pansexual">Pansexual</option>
                  <option value="Assexual">Assexual</option>
                  <option value="Outro">Outro</option>
                  <option value="Prefiro não informar">Prefiro não informar</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="race" className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "#8E8E93" }}>Raça / Etnia</label>
              <select id="race" value={race} onChange={(e) => setRace(e.target.value)} required disabled={isPending}
                className="w-full h-12 rounded-2xl px-4 text-sm outline-none border transition-colors appearance-none"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#dc2626")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2C2C2E")}
              >
                <option disabled value="" style={{ color: "#48484A" }}>Selecione</option>
                <option value="Branca">Branca</option>
                <option value="Preta">Preta</option>
                <option value="Parda">Parda</option>
                <option value="Amarela">Amarela</option>
                <option value="Indígena">Indígena</option>
                <option value="Prefiro não informar">Prefiro não informar</option>
              </select>
            </div>
          </div>

          <div className="flex items-start gap-3 mt-2 p-4 rounded-xl border border-neutral-200 dark:border-[#2C2C2E] bg-white/5 dark:bg-black/20">
            <input 
              type="checkbox" 
              id="lgpd" 
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-neutral-300 dark:border-[#2C2C2E] text-red-600 focus:ring-red-600 focus:ring-offset-black"
            />
            <label htmlFor="lgpd" className="text-xs text-neutral-600 dark:text-[#8E8E93] leading-relaxed">
              Li e concordo com os Termos de Uso e Política de Privacidade (LGPD). Compreendo que meus dados serão utilizados exclusivamente para fins de controle de presença e relatórios acadêmicos do projeto de extensão Jiu-Jitsu para Todos (JJCAC).
            </label>
          </div>

          <div className="flex gap-3 mt-4">
            <button 
              type="button"
              onClick={() => setStep(2)}
              disabled={isPending}
              className="w-1/3 h-[54px] rounded-full border text-sm font-semibold tracking-tight transition-colors"
              aria-label="Voltar para o passo anterior"
              style={{ borderColor: "#2C2C2E", color: "#8E8E93", background: "transparent" }}
            >
              VOLTAR
            </button>
            <ShimmerButton 
              type="submit" 
              disabled={isPending || !acceptedTerms}
              className="w-2/3 h-[54px] rounded-full"
              shimmerColor="#ffffff"
              shimmerSize="0.05em"
              aria-label="Concluir cadastro"
              style={{
                opacity: isPending ? 0.7 : 1,
              }}
            >
              <span className="flex items-center justify-center gap-2 text-center text-base font-semibold tracking-tight text-white relative z-10">
                {isPending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> ENVIANDO...</>
                ) : (
                  "CONCLUIR"
                )}
              </span>
            </ShimmerButton>
          </div>
        </>
      )}
    </form>
  );
}
