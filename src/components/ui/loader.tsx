import { cn } from "@/lib/utils";

export function LoaderOne({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <div className="w-3 h-3 bg-red-600 dark:bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-3 h-3 bg-red-600 dark:bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-3 h-3 bg-red-600 dark:bg-red-500 rounded-full animate-bounce"></div>
    </div>
  );
}

export function LoaderTwo({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center w-12 h-12", className)}>
      <div className="absolute inset-0 rounded-full border-[3px] border-border" />
      <div className="absolute inset-0 rounded-full border-[3px] border-red-600 border-t-transparent animate-spin" />
      <div className="absolute inset-2 rounded-full border-[2px] border-neutral-300 dark:border-[#3A3A3C] border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]" />
    </div>
  );
}
