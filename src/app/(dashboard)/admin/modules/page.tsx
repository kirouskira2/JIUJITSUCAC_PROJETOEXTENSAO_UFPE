import { Metadata } from "next";
import { listPrinciples } from "@/actions/principles";
import { Principle } from "@/lib/schemas";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const metadata: Metadata = {
  title: "Módulos Educacionais | JJCAC",
};

export const revalidate = 3600; // 1 hora de cache (os princípios não mudam frequentemente)

export default async function ModulesPage() {
  const result = await listPrinciples();
  const principles: Principle[] = result.success && result.data ? result.data : [];

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-[1200px] mx-auto w-full gap-8">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight text-neutral-900 dark:text-[#F2F2F7]">
          Módulos <span className="text-red-600 dark:text-red-500">Educacionais</span>
        </h1>
        <p className="text-sm md:text-base text-neutral-600 dark:text-[#8E8E93] max-w-2xl">
          Os 32 princípios fundamentais do Jiu-Jitsu para Todos. Explore cada módulo para entender como aplicá-los no tatame e na vida.
        </p>
      </div>

      {/* Grid de Princípios */}
      {principles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {principles.map((principle) => (
            <Dialog key={principle.id}>
              <DialogTrigger render={<button className="cursor-pointer text-left rounded-3xl border border-border p-4 flex flex-col gap-3 bg-surface-container hover:border-red-500/50 transition-colors w-full group" />}>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-500">
                      Módulo {principle.number}
                    </span>
                  </div>
                  <h4 className="font-display text-lg font-black uppercase leading-tight text-neutral-900 dark:text-[#F2F2F7] group-hover:text-red-500 transition-colors">
                    {principle.titlePt}
                  </h4>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" showCloseButton>
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl font-black uppercase text-neutral-900 dark:text-white">
                    {principle.number}. {principle.titlePt}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-500">
                    {principle.titleEn} • {principle.category}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 mt-2">
                  {principle.description.split('. Na vida:').map((part: string, index: number) => (
                    <div key={index} className="flex flex-col gap-1">
                      <span className="text-xs font-bold uppercase text-neutral-500 dark:text-[#8E8E93]">
                        {index === 0 ? "No Tatame" : "Na Vida"}
                      </span>
                      <p className="text-sm leading-relaxed text-neutral-700 dark:text-[#E5E5EA]">
                        {index === 0 ? part.replace('No tatame: ', '').trim() + '.' : part.trim()}
                      </p>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center p-12 border border-border rounded-3xl border-dashed">
          <p className="text-sm text-neutral-500 dark:text-[#8E8E93]">
            Nenhum módulo educacional cadastrado.
          </p>
        </div>
      )}
    </div>
  );
}
