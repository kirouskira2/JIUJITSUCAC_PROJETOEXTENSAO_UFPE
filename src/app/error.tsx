"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Ops! Algo deu errado.</h2>
        <p className="text-zinc-500 mb-6">
          Ocorreu um erro inesperado no servidor. Nossa equipe já foi notificada.
        </p>
        <div className="flex flex-col gap-2">
          <Button onClick={() => reset()} className="w-full bg-red-600 hover:bg-red-700">
            Tentar Novamente
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'} className="w-full">
            Voltar para o Início
          </Button>
        </div>
      </div>
    </div>
  );
}
