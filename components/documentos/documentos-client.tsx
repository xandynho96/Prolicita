"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CATEGORIA_META, STATUS_META } from "@/lib/documentos/meta";
import {
  CHECKLIST_HABILITACAO,
  CHECKLIST_GRUPO_META,
  type ChecklistItem,
} from "@/lib/documentos/checklist";
import { formatarDiasLabel } from "@/lib/documentos/status";
import { UploadDialog } from "./upload-dialog";
import { DocumentoSheet } from "./documento-sheet";
import type { documentos, licitacoes } from "@/lib/db/schema";

export type DocumentoRow = Omit<typeof documentos.$inferSelect, "arquivoBase64">;
export type LicitacaoRow = typeof licitacoes.$inferSelect;

const GRUPOS_ORDEM: ChecklistItem["grupo"][] = [
  "juridico",
  "fiscal",
  "economico",
  "tecnico",
  "declaracoes",
];

function statusDoItem(doc: DocumentoRow | undefined) {
  if (!doc) return { label: "Pendente", bg: "#EEF0F3", color: "#565F6B" };
  if (doc.conformeLei14133 === false) {
    return { label: "Não conforme", bg: "#FBE7E7", color: "#B23A3A" };
  }
  return STATUS_META[doc.status];
}

export function DocumentosClient({
  documentos: documentosIniciais,
  licitacoes,
}: {
  documentos: DocumentoRow[];
  licitacoes: LicitacaoRow[];
}) {
  const [docs, setDocs] = useState(documentosIniciais);
  const [uploadContexto, setUploadContexto] = useState<
    "livre" | { item: ChecklistItem } | null
  >(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reanalyzingId, setReanalyzingId] = useState<string | null>(null);

  const porItem = useMemo(() => {
    const map = new Map<string, DocumentoRow>();
    for (const doc of docs) {
      if (!doc.checklistItemId) continue;
      const atual = map.get(doc.checklistItemId);
      if (!atual || new Date(doc.createdAt) > new Date(atual.createdAt)) {
        map.set(doc.checklistItemId, doc);
      }
    }
    return map;
  }, [docs]);

  const outros = useMemo(() => docs.filter((d) => !d.checklistItemId), [docs]);

  const totalItens = CHECKLIST_HABILITACAO.length;
  const itensCompletos = CHECKLIST_HABILITACAO.filter((item) => {
    const doc = porItem.get(item.id);
    return doc && doc.conformeLei14133 !== false && doc.status !== "vencido";
  }).length;

  const naoConformeCount = [...porItem.values()].filter(
    (d) => d.conformeLei14133 === false
  ).length;
  const vencendoCount = [...porItem.values()].filter(
    (d) => d.conformeLei14133 !== false && d.status === "vencendo"
  ).length;
  const vencidoCount = [...porItem.values()].filter(
    (d) => d.conformeLei14133 !== false && d.status === "vencido"
  ).length;
  const hasAlerts = naoConformeCount + vencendoCount + vencidoCount > 0;

  const alertaPartes: string[] = [];
  if (naoConformeCount > 0) alertaPartes.push(`${naoConformeCount} não conforme(s)`);
  if (vencidoCount > 0) alertaPartes.push(`${vencidoCount} vencido(s)`);
  if (vencendoCount > 0) alertaPartes.push(`${vencendoCount} vencendo em breve`);

  const handleUploaded = (doc: DocumentoRow) => {
    setDocs((d) => [doc, ...d]);
    setUploadContexto(null);
  };

  const handleReanalyze = async (id: string) => {
    setReanalyzingId(id);
    try {
      const res = await fetch(`/api/documentos/${id}/reanalyze`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Falha ao reanalisar documento");
        return;
      }
      setDocs((d) => d.map((doc) => (doc.id === id ? data.documento : doc)));
      toast.success("Documento reanalisado com sucesso");
    } catch {
      toast.error("Falha ao reanalisar documento");
    } finally {
      setReanalyzingId(null);
    }
  };

  const selected = docs.find((d) => d.id === selectedId) ?? null;
  const checklistItemAtivo =
    uploadContexto && uploadContexto !== "livre" ? uploadContexto.item : null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[27px] font-extrabold tracking-tight">Documentos</h1>
        <p className="mt-1.5 max-w-[620px] text-[14.5px] text-muted-foreground">
          Checklist dos documentos de habilitação para licitações — envie
          contra cada item e a IA avalia a conformidade.
        </p>
      </div>

      <div className="rounded-[14px] border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between text-[13.5px] font-bold">
          <span>
            {itensCompletos} de {totalItens} itens completos
          </span>
          <span className="text-muted-foreground">
            {Math.round((itensCompletos / totalItens) * 100)}%
          </span>
        </div>
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-accent">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(itensCompletos / totalItens) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-[#DCE3F5] bg-[#F3F6FE] px-5 py-3.5 text-[13px] leading-relaxed text-[#2B3A5C]">
        <strong>Checklist de apoio baseado na Lei 14.133/21.</strong> Confirme
        sempre as exigências específicas do edital antes de enviar a
        documentação — a avaliação da IA é um apoio operacional, não parecer
        jurídico.
      </div>

      {hasAlerts && (
        <div className="flex items-center gap-3.5 rounded-xl border border-[#F0D89B] bg-[#FCF1DC] px-5 py-3.5">
          <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#C77C1E]" />
          <div className="flex-1 text-[13.5px] leading-relaxed text-[#7A5416]">
            <strong>Atenção:</strong> {alertaPartes.join(", ")}.
          </div>
        </div>
      )}

      {GRUPOS_ORDEM.map((grupo) => {
        const itens = CHECKLIST_HABILITACAO.filter((i) => i.grupo === grupo);
        return (
          <div
            key={grupo}
            className="overflow-hidden rounded-[14px] border border-border bg-white shadow-sm"
          >
            <div className="border-b border-border px-5 py-3.5 text-[13.5px] font-extrabold">
              {CHECKLIST_GRUPO_META[grupo].label}
            </div>
            <div className="divide-y divide-border">
              {itens.map((item) => {
                const doc = porItem.get(item.id);
                const status = statusDoItem(doc);
                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold">{item.nome}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {item.baseLegal}
                        {doc
                          ? ` · ${formatarDiasLabel(doc.dataValidade, doc.semVencimento)}`
                          : ""}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <span
                        className="whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold"
                        style={{ background: status.bg, color: status.color }}
                      >
                        {status.label}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant={doc ? "outline" : "default"}
                        onClick={() =>
                          doc
                            ? setSelectedId(doc.id)
                            : setUploadContexto({ item })
                        }
                      >
                        {doc ? "Ver documento" : "Enviar documento"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="rounded-[14px] border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <span className="text-[13.5px] font-extrabold">Outros documentos</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setUploadContexto("livre")}
          >
            + Enviar outro documento
          </Button>
        </div>
        {outros.length === 0 ? (
          <div className="px-5 py-6 text-center text-[13px] text-muted-foreground">
            Propostas, editais salvos ou outros documentos fora do checklist
            aparecem aqui.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {outros.map((doc) => {
              const cat = CATEGORIA_META[doc.categoria];
              const status = STATUS_META[doc.status];
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedId(doc.id)}
                  className="flex cursor-pointer flex-col gap-3 rounded-[12px] border border-border bg-white p-4 shadow-sm transition-shadow hover:border-[#C9D4F5] hover:shadow-[0_6px_16px_rgba(47,95,222,0.10)]"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] text-[11.5px] font-extrabold text-white"
                      style={{ background: cat.color }}
                    >
                      {cat.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-bold leading-tight">
                        {doc.nome}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {cat.label}
                      </div>
                    </div>
                    <span
                      className="shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-bold"
                      style={{ background: status.bg, color: status.color }}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <UploadDialog
        open={!!uploadContexto}
        onOpenChange={(open) => !open && setUploadContexto(null)}
        licitacoes={licitacoes}
        checklistItem={checklistItemAtivo}
        onUploaded={handleUploaded}
      />

      <DocumentoSheet
        documento={selected}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onReanalyze={() => selected && handleReanalyze(selected.id)}
        reanalyzing={reanalyzingId === selected?.id}
      />
    </div>
  );
}
