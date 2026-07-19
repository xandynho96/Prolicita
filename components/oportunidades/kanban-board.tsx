"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EyeOff, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatarValor } from "@/lib/format";
import { scoreMeta } from "@/lib/matching/score-meta";
import { ETAPAS, ETAPA_META, type Etapa } from "@/lib/oportunidades/meta";
import { OportunidadeSheet } from "./oportunidade-sheet";
import type {
  empresaLicitacaoMatches,
  licitacoes,
  oportunidades,
  prazos,
} from "@/lib/db/schema";

export type OportunidadeRow = typeof oportunidades.$inferSelect;
export type LicitacaoRow = typeof licitacoes.$inferSelect;
export type MatchRow = typeof empresaLicitacaoMatches.$inferSelect;
export type PrazoRow = typeof prazos.$inferSelect;

interface Item {
  oportunidade: OportunidadeRow;
  licitacao: LicitacaoRow;
  match: MatchRow | null;
}

export function KanbanBoard({
  oportunidades: iniciais,
  disponiveis,
  prazos: prazosIniciais,
}: {
  oportunidades: Item[];
  disponiveis: LicitacaoRow[];
  prazos: PrazoRow[];
}) {
  const [items, setItems] = useState(iniciais);
  const [prazosLista, setPrazosLista] = useState(prazosIniciais);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [ignoradaAberta, setIgnoradaAberta] = useState(false);

  const moverEtapa = async (oportunidadeId: string, etapa: Etapa) => {
    setItems((list) =>
      list.map((it) =>
        it.oportunidade.id === oportunidadeId
          ? { ...it, oportunidade: { ...it.oportunidade, etapa } }
          : it
      )
    );

    const res = await fetch(`/api/oportunidades/${oportunidadeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ etapa }),
    });

    if (!res.ok) {
      toast.error("Falha ao mover a oportunidade");
    }
  };

  const adicionar = async (licitacaoId: string) => {
    const res = await fetch("/api/oportunidades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licitacaoId }),
    });
    const data = await res.json();
    if (!res.ok || !data.oportunidade) {
      toast.error(data.error ?? "Falha ao adicionar oportunidade");
      return;
    }
    const licitacao = disponiveis.find((l) => l.id === licitacaoId);
    if (licitacao) {
      setItems((list) => [
        ...list,
        { oportunidade: data.oportunidade, licitacao, match: null },
      ]);
    }
    setAddOpen(false);
    toast.success("Oportunidade adicionada ao pipeline");
  };

  const selected = items.find((it) => it.oportunidade.id === selectedId) ?? null;
  const disponiveisFiltradas = disponiveis.filter(
    (l) => !items.some((it) => it.licitacao.id === l.id)
  );

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="text-[27px] font-extrabold tracking-tight">
            Pipeline de oportunidades
          </h1>
          <p className="mt-1.5 max-w-[620px] text-[14.5px] text-muted-foreground">
            Acompanhe cada licitação relevante do primeiro contato até o
            resultado final.
          </p>
        </div>
        {disponiveisFiltradas.length > 0 && (
          <Button onClick={() => setAddOpen(true)}>+ Adicionar oportunidade</Button>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {ETAPAS.filter((etapa) => etapa !== "ignorada").map((etapa) => {
          const coluna = items.filter((it) => it.oportunidade.etapa === etapa);
          const meta = ETAPA_META[etapa];
          return (
            <div
              key={etapa}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (draggingId) moverEtapa(draggingId, etapa);
                setDraggingId(null);
              }}
              className="flex w-[280px] shrink-0 flex-col gap-3 rounded-xl bg-accent/40 p-3"
            >
              <div className="flex items-center justify-between px-1">
                <span
                  className="text-[12.5px] font-bold"
                  style={{ color: meta.color }}
                >
                  {meta.label}
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                  {coluna.length}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {coluna.map(({ oportunidade, licitacao, match }) => {
                  const score = match ? scoreMeta(Number(match.matchScore ?? 0)) : null;
                  return (
                    <div
                      key={oportunidade.id}
                      draggable
                      onDragStart={() => setDraggingId(oportunidade.id)}
                      onDragEnd={() => setDraggingId(null)}
                      onClick={() => setSelectedId(oportunidade.id)}
                      className="group relative flex cursor-grab flex-col gap-2 rounded-[12px] border border-border bg-white p-3.5 shadow-sm active:cursor-grabbing"
                    >
                      <button
                        type="button"
                        title="Ignorar"
                        onClick={(e) => {
                          e.stopPropagation();
                          moverEtapa(oportunidade.id, "ignorada");
                        }}
                        className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100"
                      >
                        <EyeOff className="h-3.5 w-3.5" />
                      </button>
                      <div className="pr-5 text-[13px] font-bold leading-snug line-clamp-2">
                        {licitacao.objeto}
                      </div>
                      <div className="text-[11.5px] text-muted-foreground line-clamp-1">
                        {licitacao.orgaoNome}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-secondary-foreground">
                          {formatarValor(licitacao.valorEstimado)}
                        </span>
                        {score && (
                          <span
                            className="rounded-full px-2 py-0.5 text-[10.5px] font-bold"
                            style={{ background: score.bg, color: score.color }}
                          >
                            {score.label}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {coluna.length === 0 && (
                  <div className="rounded-[12px] border border-dashed border-border px-3 py-6 text-center text-[12px] text-muted-foreground">
                    Nenhuma oportunidade
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(() => {
        const colunaIgnorada = items.filter(
          (it) => it.oportunidade.etapa === "ignorada"
        );
        return (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggingId) moverEtapa(draggingId, "ignorada");
              setDraggingId(null);
            }}
            className="rounded-xl border border-dashed border-border p-3"
          >
            <button
              type="button"
              onClick={() => setIgnoradaAberta((v) => !v)}
              className="flex items-center gap-1.5 text-[12.5px] font-bold text-muted-foreground"
            >
              {ignoradaAberta ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
              Ignoradas ({colunaIgnorada.length})
            </button>

            {ignoradaAberta && (
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {colunaIgnorada.map(({ oportunidade, licitacao }) => (
                  <div
                    key={oportunidade.id}
                    draggable
                    onDragStart={() => setDraggingId(oportunidade.id)}
                    onDragEnd={() => setDraggingId(null)}
                    onClick={() => setSelectedId(oportunidade.id)}
                    className="flex cursor-grab flex-col gap-1.5 rounded-[10px] border border-border bg-accent/30 p-3 text-muted-foreground shadow-sm active:cursor-grabbing"
                  >
                    <div className="text-[12.5px] font-semibold leading-snug line-clamp-2">
                      {licitacao.objeto}
                    </div>
                    <div className="text-[11px] line-clamp-1">
                      {licitacao.orgaoNome}
                    </div>
                  </div>
                ))}
                {colunaIgnorada.length === 0 && (
                  <div className="text-[12px] text-muted-foreground">
                    Nenhuma oportunidade ignorada.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      <OportunidadeSheet
        item={selected}
        prazos={prazosLista.filter(
          (p) => p.oportunidadeId === selected?.oportunidade.id
        )}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onUpdated={(oportunidade) =>
          setItems((list) =>
            list.map((it) =>
              it.oportunidade.id === oportunidade.id ? { ...it, oportunidade } : it
            )
          )
        }
        onPrazoCriado={(prazo) => setPrazosLista((list) => [...list, prazo])}
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Adicionar oportunidade</DialogTitle>
          </DialogHeader>
          <div className="flex max-h-[400px] flex-col gap-2 overflow-y-auto">
            {disponiveisFiltradas.map((lic) => (
              <button
                key={lic.id}
                onClick={() => adicionar(lic.id)}
                className="rounded-lg border border-border p-3 text-left text-[13px] hover:border-primary/40 hover:bg-accent/40"
              >
                <div className="font-semibold line-clamp-1">{lic.objeto}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {lic.orgaoNome}
                </div>
              </button>
            ))}
            {disponiveisFiltradas.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma licitação relevante disponível para adicionar.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
