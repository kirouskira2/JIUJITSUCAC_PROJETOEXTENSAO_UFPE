import QRCode from "react-qr-code";
import Link from "next/link";
import { IconArrowLeft, IconPrinter } from "@tabler/icons-react";
import { createHmac } from "crypto";
import { PrintButton } from "./print-button";

export default function AdminPrintQrPage() {
  // Gera o token HMAC-SHA256 oficial do tatame
  const signingKey = process.env.HMAC_SIGNING_KEY || "jjcac-hmac-default-key-2026";
  const secret = process.env.QR_SECRET || "JJCAC-TATAME-UFPE";
  
  const qrToken = createHmac("sha256", signingKey)
      .update(secret)
      .digest("hex");

  return (
    <div className="flex flex-col h-full items-center justify-center py-10 px-4 min-h-[80vh] print:py-0 print:px-0 print:min-h-0 print:h-screen print:bg-white">
      
      <div className="w-full max-w-2xl bg-white dark:bg-[#111111] print:bg-white print:border-none border border-neutral-200 dark:border-[#2C2C2E] rounded-3xl p-8 flex flex-col items-center relative overflow-hidden shadow-2xl print:shadow-none">
        
        <div className="w-full flex items-center justify-between mb-12 relative z-10 print:hidden">
          <Link
            href="/admin"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-[#1C1C1E] border border-neutral-200 dark:border-[#2C2C2E] text-red-600 dark:text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <IconArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-right flex gap-3 items-center">
            <h2 className="font-display font-black text-xl uppercase tracking-tight text-neutral-900 dark:text-[#F2F2F7]">
              QR Code do Tatame
            </h2>
            <PrintButton />
          </div>
        </div>

        {/* Print Layout Area */}
        <div className="flex flex-col items-center justify-center w-full relative z-10">
          
          <img src="/logo.jpg" alt="JIU JITSU CAC" className="w-32 h-32 rounded-full mb-8 print:w-48 print:h-48 print:mb-12" />
          
          <h1 className="font-display font-black text-4xl uppercase tracking-tight text-neutral-900 dark:text-black mb-4 print:text-5xl text-center">
            PONTO ELETRÔNICO
          </h1>
          
          <p className="text-lg text-neutral-600 dark:text-neutral-400 print:text-black font-medium mb-12 text-center max-w-md print:max-w-xl print:text-2xl">
            Aponte a câmera do seu celular para registrar a presença no treino de hoje. Oss!
          </p>

          <div className="w-full max-w-[350px] print:max-w-[550px] bg-white p-6 rounded-3xl mb-12 shadow-xl print:shadow-none print:border-8 print:border-black">
            <QRCode
              value={qrToken}
              size={512}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          </div>

          <p className="text-xs text-neutral-400 uppercase font-bold tracking-widest print:text-black print:text-lg">
            JIU JITSU CAC - PROJETO DE EXTENSÃO UFPE
          </p>
        </div>

      </div>
    </div>
  );
}
