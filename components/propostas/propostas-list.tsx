"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { licitacoes, propostas } from "@/lib/db/schema";

type Proposta = typeof propostas.$inferSelect;
type Licitacao = typeof licitacoes.$inferSelect;

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  rascunho: { label: "Rascunho", bg: "#FCF1DC", color: "#9A6316" },
  finalizada: { label: "Finalizada", bg: "#E3F5EC", color: "#12896B" },
};

export function PropostasList({
  itens,
}: {
  itens: { proposta: Proposta; licitacao: Licitacao }[];
}) {
  const [lista, setLista] = useState(itens);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const router = useRouter();

  const excluir = async (id: string) => {
    if (
      !window.confirm("Excluir esta proposta? Essa ação não pode ser desfeita.")
    ) {
      return;
    }
    setExcluindoId(id);
    const res = await fetch(`/api/propostas/${id}`, { method: "DELETE" });
    setExcluindoId(null);
    if (!res.ok) {
      toast.error("Falha ao excluir proposta");
      return;
    }
    setLista((l) => l.filter((item) => item.proposta.id !== id));
    router.refresh();
    toast.success("Proposta excluída");
  };

  if (lista.length === 0) {
    return (
      <div className="py-10 text-center text-[13.5px] text-muted-foreground">
        Nenhuma proposta gerada ainda. Abra uma oportunidade no{" "}
        <Link href="/oportunidades" className="font-bold text-primary hover:underline">
          Pipeline
        </Link>{" "}
        e clique em &quot;Gerar proposta&quot;.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {lista.map(({ proposta, licitacao }) => {
        const status = STATUS_LABEL[proposta.status];
        return (
          <Link
            key={proposta.id}
            href={`/propostas/${proposta.id}`}
            className="group relative flex flex-col gap-2 rounded-[14px] border border-border bg-white p-5 shadow-sm transition-shadow hover:border-[#C9D4F5] hover:shadow-[0_6px_16px_rgba(47,95,222,0.10)]"
          >
            <div className="flex items-start justify-between gap-3.5">
              <div className="min-w-0">
                <div className="text-[15px] font-bold">{licitacao.objeto}</div>
                <div className="mt-1 text-[12.5px] text-muted-foreground">
                  {licitacao.orgaoNome}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className="whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                  style={{ background: status.bg, color: status.color }}
                >
                  {status.label}
                </span>
                <button
                  type="button"
                  title="Excluir proposta"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    excluir(proposta.id);
                  }}
                  disabled={excluindoId === proposta.id}
                  className="rounded-full p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-destructive group-hover:opacity-100 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
