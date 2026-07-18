"use client";

import { useState } from "react";
import { PillToggle } from "@/components/ui/pill-toggle";
import type { licitacoes, notificacoes } from "@/lib/db/schema";

type NotificacaoRow = typeof notificacoes.$inferSelect;
type LicitacaoRow = typeof licitacoes.$inferSelect;

const CANAL_META: Record<string, { label: string; initials: string; bg: string; color: string }> = {
  painel: { label: "Painel", initials: "PA", bg: "#EEF1F5", color: "#3C4450" },
  whatsapp: { label: "WhatsApp", initials: "WA", bg: "#E3F5EC", color: "#12896B" },
};

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  enviado: { label: "Enviado", bg: "#E3F5EC", color: "#12896B" },
  erro: { label: "Erro", bg: "#FBE7E7", color: "#B23A3A" },
};

const FILTROS = [
  { key: "todas", label: "Todas" },
  { key: "painel", label: "Painel" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "erros", label: "Erros" },
];

function formatarData(data: Date): string {
  return new Date(data).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificacoesClient({
  notificacoes,
}: {
  notificacoes: { notificacao: NotificacaoRow; licitacao: LicitacaoRow }[];
}) {
  const [filtro, setFiltro] = useState("todas");

  const filtradas = notificacoes.filter(({ notificacao }) => {
    if (filtro === "todas") return true;
    if (filtro === "erros") return notificacao.status === "erro";
    return notificacao.canal === filtro;
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[27px] font-extrabold tracking-tight">
          Notificações
        </h1>
        <p className="mt-1.5 max-w-[620px] text-[14.5px] text-muted-foreground">
          Histórico de avisos enviados pelo painel e pelo WhatsApp, com
          status de entrega.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <PillToggle
            key={f.key}
            active={filtro === f.key}
            onClick={() => setFiltro(f.key)}
          >
            {f.label}
          </PillToggle>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {filtradas.length === 0 && (
          <div className="py-10 text-center text-[13.5px] text-muted-foreground">
            Nenhuma notificação para esse filtro.
          </div>
        )}
        {filtradas.map(({ notificacao, licitacao }) => {
          const canal = CANAL_META[notificacao.canal];
          const status = STATUS_META[notificacao.status];
          return (
            <div
              key={notificacao.id}
              className="flex items-start gap-3.5 rounded-xl border border-border bg-white p-4.5 shadow-sm"
            >
              <div
                className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[9px] text-[11.5px] font-extrabold"
                style={{ background: canal.bg, color: canal.color }}
              >
                {canal.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="text-sm font-bold">
                    {licitacao.orgaoNome}
                  </div>
                  <span
                    className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold"
                    style={{ background: status.bg, color: status.color }}
                  >
                    {status.label}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  {notificacao.mensagem.split("\n")[0]}
                </p>
                <div className="mt-2 text-xs text-muted-foreground/80">
                  {canal.label} · {formatarData(notificacao.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
