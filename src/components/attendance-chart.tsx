"use client";

import { ComboChart } from "@/components/ComboChart";

/**
 * Gráfico de presenças por semana (Admin Dashboard)
 * Ref: Artifact 1, RF04 — Dashboard analítico, gráficos de presença
 * Adaptado para usar ComboChart (Barras + Linhas)
 */

interface AttendanceWeek {
  week: string;
  count: number;
  unique?: number;
}

interface AttendanceChartProps {
  data: AttendanceWeek[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Nenhum dado de presença disponível.
      </div>
    );
  }

  // Prepara os dados pro ComboChart
  const chartData = data.map(item => ({
    date: item.week,
    "Total Presenças": item.count,
    "Alunos Únicos": item.unique || 0,
  })).reverse(); // Reverse para mostrar a mais antiga (3 Sem) na esquerda e a Atual na direita

  return (
    <div className="mt-4">
      <ComboChart
        data={chartData}
        index="date"
        enableBiaxial={false}
        barSeries={{
          categories: ["Total Presenças"],
          colors: ["#3b82f6"], // Azul (similar a imagem SolarPanels)
          yAxisLabel: "Presenças",
        }}
        lineSeries={{
          categories: ["Alunos Únicos"],
          colors: ["#f59e0b"], // Laranja (similar a imagem Inverters)
        }}
      />
    </div>
  );
}
