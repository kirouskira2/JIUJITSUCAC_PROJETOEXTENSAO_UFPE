import { IconBook } from "@tabler/icons-react";

export default function PrincipiosPage() {
  const principles = [
    "O Princípio da Conexão",
    "O Princípio do Afastamento",
    "O Princípio da Distância",
    "O Princípio da Pirâmide",
    "O Princípio da Criação",
    "O Princípio da Aceitação",
    "O Princípio da Velocidade",
    "O Princípio do Relógio",
    "O Princípio do Rio",
    "O Princípio da Estrutura",
    "O Princípio de Kuzushi",
    "O Princípio do Reconhecimento",
    "O Princípio da Prevenção",
    "O Princípio da Tensão",
    "O Princípio do Forcado",
    "O Princípio da Postura",
    "O Princípio da Falsa Rendição",
    "O Princípio do Esgotamento",
    "O Princípio do Isolamento",
    "O Princípio do Sacrifício",
    "O Princípio do Impulso",
    "O Princípio do Pivô",
    "O Princípio da Carona",
    "O Princípio da Sobrecarga",
    "O Princípio da Âncora",
    "O Princípio da Chave-Catraca",
    "O Princípio da Flutuação",
    "O Princípio do Controle da Cabeça",
    "O Princípio do Redirecionamento",
    "O Princípio da Mobilidade",
    "O Princípio da Linha Central",
    "O Princípio do Grande Mestre",
  ];

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
        {principles.map((p, idx) => (
          <div 
            key={idx}
            className="rounded-2xl border border-neutral-200 dark:border-[#2C2C2E] p-5 flex flex-col gap-3 transition-all hover:border-[#dc2626]/50 hover:-translate-y-1 hover:shadow-xl group bg-white dark:bg-[#111111]"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-neutral-100 dark:bg-[#1C1C1E] text-neutral-500 dark:text-[#8E8E93] group-hover:bg-[#dc2626] group-hover:text-white transition-colors">
              <span className="font-mono font-bold text-sm">{String(idx + 1).padStart(2, "0")}</span>
            </div>
            <h3 className="font-sans font-bold text-base leading-snug mt-1 text-neutral-900 dark:text-[#F2F2F7] group-hover:text-[#dc2626] transition-colors">
              {p}
            </h3>
          </div>
        ))}
      </div>

    </div>
  );
}
