"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleLogout} 
      disabled={isPending}
      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full w-10 h-10 ml-auto"
      title="Sair"
    >
      <LogOut className="h-5 w-5" />
    </Button>
  );
}
