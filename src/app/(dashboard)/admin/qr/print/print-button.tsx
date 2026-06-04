"use client";

import { IconPrinter } from "@tabler/icons-react";

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors"
    >
      <IconPrinter className="w-4 h-4" />
      Imprimir (Ctrl+P)
    </button>
  );
}
