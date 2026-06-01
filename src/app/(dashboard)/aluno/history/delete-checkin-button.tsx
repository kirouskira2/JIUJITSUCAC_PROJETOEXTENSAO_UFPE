"use client";

import { useState } from "react";
import { IconTrash } from "@tabler/icons-react";
import { deleteCheckin } from "@/actions/checkin";

export function DeleteCheckinButton({ attendanceId }: { attendanceId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja apagar esta presença?")) return;
    
    setIsDeleting(true);
    const result = await deleteCheckin(attendanceId);
    if (!result.success) {
      alert(result.error);
    }
    setIsDeleting(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-transparent hover:border-red-500/30 bg-neutral-100 hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-colors dark:bg-[#1C1C1E] dark:hover:bg-red-500/20 disabled:opacity-50"
      title="Apagar treino"
    >
      <IconTrash className="w-5 h-5" />
    </button>
  );
}
