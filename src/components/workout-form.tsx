"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { createWorkout, updateWorkout, deleteWorkout } from "@/actions/workouts";
import { useToast } from "@/hooks/use-toast";
import { Workout } from "@/lib/schemas";
import { Calendar, Save, Dumbbell, AlignLeft, HelpCircle, Award, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Principle {
  id: number;
  number: number;
  titlePt: string;
}

interface WorkoutFormProps {
  principles: Principle[];
  initialWorkout?: Workout;
}

interface WorkoutFormData {
  date: string;
  techniqueName: string;
  techniqueWhat: string;
  techniqueHow: string;
  techniqueWhy: string;
  principleId: string;
}

export function WorkoutForm({ principles, initialWorkout }: WorkoutFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!initialWorkout;

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<WorkoutFormData>({
    values: {
      date: initialWorkout?.date || new Date().toISOString().split("T")[0],
      techniqueName: initialWorkout?.techniqueName || "",
      techniqueWhat: initialWorkout?.techniqueWhat || "",
      techniqueHow: initialWorkout?.techniqueHow || "",
      techniqueWhy: initialWorkout?.techniqueWhy || "",
      principleId: initialWorkout?.principleId ? String(initialWorkout.principleId) : "",
    },
  });

  const onSubmit = (data: WorkoutFormData) => {
    startTransition(async () => {
      let result;
      if (isEditing) {
        result = await updateWorkout({
          workoutId: initialWorkout.id,
          techniqueName: data.techniqueName,
          techniqueWhat: data.techniqueWhat,
          techniqueHow: data.techniqueHow,
          techniqueWhy: data.techniqueWhy,
          principleId: parseInt(data.principleId, 10),
        });
      } else {
        result = await createWorkout({
          date: new Date(data.date),
          techniqueName: data.techniqueName,
          techniqueWhat: data.techniqueWhat,
          techniqueHow: data.techniqueHow,
          techniqueWhy: data.techniqueWhy,
          principleId: parseInt(data.principleId, 10),
        });
      }

      if (result.success) {
        toast({
          title: isEditing ? "Treino atualizado! 🥋" : "Treino registrado! 🥋",
          description: `Técnica "${data.techniqueName}" salva.`,
        });
        if (!isEditing) reset();
      } else {
        toast({
          title: "Erro ao salvar",
          description: result.error || "Verifique os campos.",
          variant: "destructive",
        });
      }
    });
  };

  const handleDelete = async () => {
    if (!initialWorkout?.id) return;
    if (!confirm("Tem certeza que deseja apagar este treino? Todos os check-ins associados podem ser afetados.")) return;
    
    startTransition(async () => {
      const res = await deleteWorkout(initialWorkout.id);
      if (res.success) {
        toast({ title: "Sucesso", description: "Treino apagado com sucesso!" });
        // Optional: refresh form or redirect
        router.refresh();
      } else {
        toast({
          title: "Erro",
          description: res.error || "Ocorreu um erro ao apagar.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Data */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider ml-1 flex items-center gap-1.5 text-neutral-500 dark:text-[#8E8E93]">
            <Calendar className="w-3.5 h-3.5" /> Data
          </label>
          <div className="relative">
            <input
              type="date"
              {...register("date", { required: "Obrigatório" })}
              disabled={isEditing}
              className="w-full h-[54px] rounded-2xl px-4 outline-none transition-colors border bg-neutral-100 dark:bg-[#0F0F0F] border-neutral-200 dark:border-[#2C2C2E] text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-[#dc2626]"
            />
          </div>
          {errors.date && <span className="text-xs text-red-600 dark:text-[#FF3B30]">{errors.date.message}</span>}
        </div>

        {/* Princípio */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider ml-1 flex items-center gap-1.5 text-neutral-500 dark:text-[#8E8E93]">
            <Award className="w-3.5 h-3.5" /> Princípio
          </label>
          <div className="relative">
            <select
              {...register("principleId", { required: "Obrigatório" })}
              className="w-full h-[54px] rounded-2xl pl-4 pr-10 outline-none transition-colors border appearance-none bg-neutral-100 dark:bg-[#0F0F0F] border-neutral-200 dark:border-[#2C2C2E] text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-[#dc2626]"
            >
              <option value="" disabled className="text-neutral-500 dark:text-[#8E8E93]">Selecione um princípio...</option>
              {principles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.number}. {p.titlePt}
                </option>
              ))}
            </select>
          </div>
          {errors.principleId && <span className="text-xs text-red-600 dark:text-[#FF3B30]">{errors.principleId.message}</span>}
        </div>
      </div>

      <div className="h-px w-full bg-neutral-200 dark:bg-[#2C2C2E]" />

      {/* Técnica */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider ml-1 flex items-center gap-1.5 text-neutral-500 dark:text-[#8E8E93]">
          <Dumbbell className="w-3.5 h-3.5" /> Técnica
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Ex: Passagem de Guarda Toreando"
            {...register("techniqueName", { required: "Obrigatório" })}
            className="w-full h-[54px] rounded-2xl px-4 outline-none transition-colors border bg-neutral-100 dark:bg-[#0F0F0F] border-neutral-200 dark:border-[#2C2C2E] text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-[#dc2626]"
          />
        </div>
        {errors.techniqueName && <span className="text-xs text-red-600 dark:text-[#FF3B30]">{errors.techniqueName.message}</span>}
      </div>

      {/* What */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider ml-1 flex items-center gap-1.5 text-neutral-500 dark:text-[#8E8E93]">
          <AlignLeft className="w-3.5 h-3.5" /> O que se faz
        </label>
        <textarea
          rows={3}
          placeholder="Descreva a técnica..."
          {...register("techniqueWhat", { required: "Obrigatório" })}
          className="w-full rounded-2xl p-4 outline-none transition-colors border resize-none bg-neutral-100 dark:bg-[#0F0F0F] border-neutral-200 dark:border-[#2C2C2E] text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-[#dc2626]"
        />
        {errors.techniqueWhat && <span className="text-xs text-red-600 dark:text-[#FF3B30]">{errors.techniqueWhat.message}</span>}
      </div>

      {/* How */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider ml-1 flex items-center gap-1.5 text-neutral-500 dark:text-[#8E8E93]">
          <AlignLeft className="w-3.5 h-3.5" /> Como se faz
        </label>
        <textarea
          rows={4}
          placeholder="Descreva a execução..."
          {...register("techniqueHow", { required: "Obrigatório" })}
          className="w-full rounded-2xl p-4 outline-none transition-colors border resize-none bg-neutral-100 dark:bg-[#0F0F0F] border-neutral-200 dark:border-[#2C2C2E] text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-[#dc2626]"
        />
        {errors.techniqueHow && <span className="text-xs text-red-600 dark:text-[#FF3B30]">{errors.techniqueHow.message}</span>}
      </div>

      {/* Why */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider ml-1 flex items-center gap-1.5 text-neutral-500 dark:text-[#8E8E93]">
          <HelpCircle className="w-3.5 h-3.5" /> Por que se faz
        </label>
        <textarea
          rows={3}
          placeholder="Fundamento tático..."
          {...register("techniqueWhy", { required: "Obrigatório" })}
          className="w-full rounded-2xl p-4 outline-none transition-colors border resize-none bg-neutral-100 dark:bg-[#0F0F0F] border-neutral-200 dark:border-[#2C2C2E] text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-[#dc2626]"
        />
        {errors.techniqueWhy && <span className="text-xs text-red-600 dark:text-[#FF3B30]">{errors.techniqueWhy.message}</span>}
      </div>

      <div className="flex gap-3 mt-4">
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="w-14 h-[54px] shrink-0 rounded-full flex items-center justify-center transition-all bg-neutral-100 dark:bg-[#1C1C1E] border border-neutral-200 dark:border-[#2C2C2E] text-red-600 dark:text-[#dc2626] hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 h-[54px] rounded-full font-semibold text-base transition-all flex items-center justify-center gap-2"
          style={{
            background: "#dc2626",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(220,38,38,0.3)",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> SALVANDO...</>
          ) : (
            <><Save className="w-5 h-5" /> {isEditing ? "ATUALIZAR TREINO" : "REGISTRAR TREINO"}</>
          )}
        </button>
      </div>
    </form>
  );
}
