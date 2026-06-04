import { cn } from "@/lib/utils";

interface LoaderTwoProps {
  className?: string;
}

export function LoaderTwo({ className }: LoaderTwoProps) {
  return (
    <div className={cn("relative flex items-center justify-center w-12 h-12", className)}>
      <div className="absolute inset-0 rounded-full border-[3px] border-neutral-200 dark:border-[#2C2C2E]" />
      <div className="absolute inset-0 rounded-full border-[3px] border-red-600 border-t-transparent animate-spin" />
      <div className="absolute inset-2 rounded-full border-[2px] border-neutral-300 dark:border-[#3A3A3C] border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]" />
    </div>
  );
}
