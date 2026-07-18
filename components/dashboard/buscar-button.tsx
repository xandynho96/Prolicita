"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function BuscarAgoraButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/licitacoes/buscar", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Falha ao buscar licitações");
        return;
      }

      toast.success(
        `Busca concluída: ${data.matches} nova(s) licitação(ões) compatível(eis) encontrada(s)`
      );
      router.refresh();
    } catch {
      toast.error("Falha ao buscar licitações");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={loading}>
      <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
      {loading ? "Buscando..." : "Buscar agora"}
    </Button>
  );
}
