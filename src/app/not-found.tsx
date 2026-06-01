import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-6 text-center">
        <div className="flex justify-center mb-4">
          <FileQuestion className="h-12 w-12 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Página não encontrada</h2>
        <p className="text-zinc-500 mb-6">
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>
        <Link href="/">
          <Button className="w-full bg-red-600 hover:bg-red-700">
            Voltar para o Início
          </Button>
        </Link>
      </div>
    </div>
  );
}
