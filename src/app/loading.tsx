import { LoaderTwo } from "@/components/ui/loader";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-[#111111]">
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
        {/* Splash Logo */}
        <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/20">
          <span className="text-white font-display font-black text-3xl tracking-tighter">
            JJCAC
          </span>
        </div>
        
        {/* Animated Loader */}
        <LoaderTwo className="w-10 h-10" />

        {/* Brand Name */}
        <div className="mt-4 flex flex-col items-center gap-1 text-center">
          <h1 className="font-display text-2xl font-black uppercase tracking-widest text-neutral-900 dark:text-[#F2F2F7]">
            Jiu Jitsu Cac
          </h1>
          <p className="text-xs text-neutral-500 dark:text-[#8E8E93] font-semibold tracking-wider">
            PROJETO DE EXTENSÃO
          </p>
        </div>
      </div>
    </div>
  );
}
