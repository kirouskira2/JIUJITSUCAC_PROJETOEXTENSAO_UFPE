import { IconBook } from "@tabler/icons-react";
import { listPrinciples } from "@/actions/principles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default async function PrincipiosPage() {
  const { data: principlesData } = await listPrinciples();
  const principles = principlesData || [];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 py-6">
      
      {/* === Header === */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-[#2C2C2E]">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500">
            <IconBook className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-black uppercase tracking-tighter text-neutral-900 dark:text-[#F2F2F7]">
              Os 32 Princípios
            </h1>
            <p className="text-sm mt-1 max-w-2xl text-neutral-500 dark:text-[#8E8E93] leading-relaxed">
              Baseado na obra de Rener Gracie e Paul Volponi. Compreenda os fundamentos ocultos do jiu-jítsu para aplicar sua sabedoria nos negócios, nos relacionamentos e em qualquer desafio da vida.
            </p>
          </div>
        </div>
      </div>

      {/* === Grid de Princípios === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {principles.map((p) => (
          <Dialog key={p.id}>
            <DialogTrigger render={<button className="text-left h-full w-full focus:outline-none" />}>
              <div 
                className="rounded-2xl border border-neutral-200 dark:border-[#2C2C2E] p-5 flex flex-col gap-3 transition-all hover:border-[#dc2626]/50 hover:-translate-y-1 hover:shadow-xl group bg-white dark:bg-[#111111] h-full"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-neutral-100 dark:bg-[#1C1C1E] text-neutral-500 dark:text-[#8E8E93] group-hover:bg-[#dc2626] group-hover:text-white transition-colors">
                    <span className="font-mono font-bold text-sm">{String(p.number).padStart(2, "0")}</span>
                  </div>
                  {p.category && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      {p.category}
                    </span>
                  )}
                </div>
                <h3 className="font-sans font-bold text-base leading-snug mt-1 text-neutral-900 dark:text-[#F2F2F7] group-hover:text-[#dc2626] transition-colors">
                  {p.titlePt}
                </h3>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 shrink-0">
                    <span className="font-mono font-bold text-lg">{String(p.number).padStart(2, "0")}</span>
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-black font-display uppercase tracking-tight">{p.titlePt}</DialogTitle>
                    <p className="text-sm font-medium text-neutral-500">{p.titleEn}</p>
                  </div>
                </div>
              </DialogHeader>
              <div className="mt-4 prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-p:text-neutral-600 dark:prose-p:text-neutral-300">
                <p>{p.description || "Descrição em desenvolvimento."}</p>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

    </div>
  );
}
