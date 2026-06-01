"use client";

import React from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface ComboChartProps {
  data: Record<string, string | number>[];
  index: string;
  enableBiaxial?: boolean;
  barSeries?: {
    categories: string[];
    yAxisLabel?: string;
    colors?: string[];
  };
  lineSeries?: {
    categories: string[];
    showYAxis?: boolean;
    yAxisLabel?: string;
    colors?: string[];
    yAxisWidth?: number;
  };
  className?: string;
}

export function ComboChart({
  data,
  index,
  enableBiaxial = false,
  barSeries,
  lineSeries,
  className,
}: ComboChartProps) {
  // Default colors mimicking Tremor
  const defaultBarColors = ["#dc2626", "#3b82f6", "#10b981"]; // Red (Brand), Blue, Green
  const defaultLineColors = ["#f59e0b", "#8b5cf6", "#ec4899"]; // Amber, Purple, Pink

  return (
    <div className={`w-full h-[300px] ${className || ""}`}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255, 255, 255, 0.05)"
            vertical={false}
          />
          <XAxis
            dataKey={index}
            tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
            tickLine={false}
          />

          {/* Eixo Y Principal (Barras) */}
          <YAxis
            yAxisId="left"
            tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            label={
              barSeries?.yAxisLabel
                ? {
                    value: barSeries.yAxisLabel,
                    angle: -90,
                    position: "insideLeft",
                    fill: "rgba(255, 255, 255, 0.5)",
                    fontSize: 12,
                    dy: 40,
                  }
                : undefined
            }
          />

          {/* Eixo Y Secundário (Linhas) se Biaxial for ativado */}
          {enableBiaxial && lineSeries?.showYAxis && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={lineSeries?.yAxisWidth || 60}
              label={
                lineSeries?.yAxisLabel
                  ? {
                      value: lineSeries.yAxisLabel,
                      angle: -90,
                      position: "insideRight",
                      fill: "rgba(255, 255, 255, 0.5)",
                      fontSize: 12,
                      dy: -40,
                    }
                  : undefined
              }
            />
          )}

          <Tooltip
            contentStyle={{
              backgroundColor: "#09090b",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              backdropFilter: "blur(16px)",
              color: "#fafafa",
              fontSize: "13px",
            }}
            itemStyle={{ color: "#fafafa" }}
            cursor={{ fill: "rgba(229, 9, 20, 0.05)" }}
          />

          <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }} />

          {/* Renderiza as Barras */}
          {barSeries?.categories.map((category, i) => (
            <Bar
              key={`bar-${category}`}
              yAxisId="left"
              dataKey={category}
              fill={barSeries.colors?.[i] || defaultBarColors[i % defaultBarColors.length]}
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          ))}

          {/* Renderiza as Linhas */}
          {lineSeries?.categories.map((category, i) => (
            <Line
              key={`line-${category}`}
              yAxisId={enableBiaxial ? "right" : "left"}
              type="monotone"
              dataKey={category}
              stroke={lineSeries.colors?.[i] || defaultLineColors[i % defaultLineColors.length]}
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
