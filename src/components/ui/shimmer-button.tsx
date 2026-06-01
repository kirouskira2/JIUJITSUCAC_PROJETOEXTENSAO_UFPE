import React, { type ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<"button"> {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children?: React.ReactNode
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "6s",
      borderRadius = "100px",
      background = "rgba(0, 0, 0, 1)",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden border border-white/10 px-6 py-3 whitespace-nowrap text-white",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
          className
        )}
        style={{
          borderRadius: borderRadius,
        }}
        {...props}
      >
        <style>
          {`
            @keyframes shimmerSpin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>

        {/* SPARK CONTAINER - Indestrutível */}
        <div className="absolute inset-0 -z-30 overflow-hidden pointer-events-none blur-[2px]" style={{ borderRadius: borderRadius }}>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: "300%",
              aspectRatio: "1/1",
              animation: `shimmerSpin ${shimmerDuration} linear infinite`,
              background: `conic-gradient(from 0deg, transparent 0deg, transparent 270deg, ${shimmerColor} 360deg)`,
            }}
          />
        </div>

        {/* Highlight interno */}
        <div
          className={cn(
            "absolute inset-0 size-full pointer-events-none",
            "shadow-[inset_0_-8px_10px_#ffffff1f]",
            "transform-gpu transition-all duration-300 ease-in-out",
            "group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]",
            "group-active:shadow-[inset_0_-10px_10px_#ffffff3f]"
          )}
          style={{ borderRadius: borderRadius }}
        />

        {/* Backdrop escuro (cobre o centro e revela as bordas) */}
        <div
          className="-z-20 absolute pointer-events-none"
          style={{
            top: shimmerSize,
            bottom: shimmerSize,
            left: shimmerSize,
            right: shimmerSize,
            borderRadius: borderRadius,
            background: background,
          }}
        />

        {children}
      </button>
    )
  }
)

ShimmerButton.displayName = "ShimmerButton"
