import Link from "next/link";
import { IconPrinter, IconDownload, IconRefresh } from "@tabler/icons-react";
import QRCode from "react-qr-code";
import { createHmac } from "crypto";

export default function AdminQRManagerPage() {
  const signingKey = process.env.HMAC_SIGNING_KEY || "jjcac-hmac-default-key-2026";
  const secret = process.env.QR_SECRET || "JJCAC-TATAME-UFPE";
  const qrToken = createHmac("sha256", signingKey).update(secret).digest("hex");

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="font-display font-black text-3xl uppercase tracking-tight text-foreground">
            Gestão do Ponto Eletrônico
          </h1>
          <p className="font-sans text-muted-foreground mt-1">
            Controle o código de acesso e visualize as estatísticas do tatame.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/qr/print"
            className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-foreground px-4 py-2 rounded-xl transition-colors font-semibold font-sans text-sm"
          >
            <IconPrinter className="w-5 h-5" />
            Imprimir
          </Link>
          <button className="flex items-center gap-2 bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-colors font-semibold font-sans text-sm shadow-[0_0_15px_rgba(220,38,38,0.3)]">
            <IconDownload className="w-5 h-5" />
            Baixar PNG
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* QR Code Card */}
        <div className="md:col-span-1 bg-surface-container border border-border rounded-3xl p-6 flex flex-col items-center justify-center text-center">
          <div className="w-48 h-48 bg-white p-3 rounded-2xl mb-6 shadow-md">
            <QRCode
              value={qrToken}
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          </div>
          <h3 className="font-sans font-bold text-lg mb-1">Código Atual</h3>
          <p className="font-sans text-sm text-muted-foreground mb-6">
            Este é o código ativo no momento.
          </p>
          <button className="flex items-center gap-2 text-primary hover:text-red-400 font-semibold text-sm transition-colors">
            <IconRefresh className="w-4 h-4" />
            Regerar Código
          </button>
        </div>

        {/* Stats & Info Cards */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-surface-container border border-border rounded-3xl p-6 flex flex-col justify-center">
              <span className="text-muted-foreground font-sans text-sm font-semibold mb-2">Check-ins Hoje</span>
              <span className="font-display font-black text-5xl text-foreground">0</span>
              <span className="text-success text-xs font-semibold mt-2">+ Atividade Normal</span>
            </div>
            <div className="bg-surface-container border border-border rounded-3xl p-6 flex flex-col justify-center">
              <span className="text-muted-foreground font-sans text-sm font-semibold mb-2">Última Atualização</span>
              <span className="font-display font-black text-4xl text-foreground">Hoje</span>
              <span className="text-muted-foreground text-xs font-semibold mt-2">QR Code Estável</span>
            </div>
          </div>
          
          <div className="bg-surface-container border border-border rounded-3xl p-6 flex-1 flex flex-col justify-center">
            <h3 className="font-sans font-bold text-lg mb-2 text-warning">Aviso de Segurança</h3>
            <p className="font-sans text-muted-foreground text-sm leading-relaxed">
              Lembre-se que, devido ao protocolo de segurança HMAC atual, o QR Code impresso no tatame deve 
              corresponder ao secret interno configurado. Ao regenerar o código, todos os códigos 
              impressos antigos se tornarão inválidos imediatamente e os alunos não conseguirão 
              registrar presença até que o novo código seja afixado na parede.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
