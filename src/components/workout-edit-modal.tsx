"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WorkoutForm } from "@/components/workout-form";
import { Workout } from "@/lib/schemas";
import { IconEdit } from "@tabler/icons-react";

interface Principle {
  id: number;
  number: number;
  titlePt: string;
}

export function WorkoutEditModal({
  initialWorkout,
  principles,
  children
}: {
  initialWorkout?: Workout | null;
  principles: Principle[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button className="w-full text-left relative group" />}>
        {children}
        {initialWorkout && (
          <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <IconEdit className="w-4 h-4 text-neutral-500 dark:text-[#8E8E93] group-hover:text-red-500" />
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialWorkout ? "Editar Treino do Dia" : "Registrar Treino"}</DialogTitle>
        </DialogHeader>
        {/* Usamos onSave event se fosse necessário, mas WorkoutForm já usa Server Action e faz o trabalho */}
        <div className="pt-4">
          <WorkoutForm 
            principles={principles} 
            initialWorkout={initialWorkout || undefined} 
            onSuccess={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
