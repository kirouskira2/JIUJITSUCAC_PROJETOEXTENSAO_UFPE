import { Particles } from "@/components/ui/particles";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4 relative overflow-hidden">
      {/* Particles Background */}
      <Particles
        className="absolute inset-0 z-0"
        quantity={100}
        ease={80}
        color="#ffffff"
        refresh
      />
      
      {/* Decorações Cyber-Premium de fundo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[100px] rounded-full" />
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
