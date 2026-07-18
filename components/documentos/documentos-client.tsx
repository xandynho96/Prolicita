"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PillToggle } from "@/components/ui/pill-toggle";
import { CATEGORIA_META, STATUS_META } from "@/lib/documentos/meta";
import { formatarDiasLabel } from "@/lib/documentos/status";
import { UploadDialog } from "./upload-dialog";
import { DocumentoSheet } from "./documento-sheet";
import type { documentos, licitacoes } from "@/lib/db/schema";

export type DocumentoRow = Omit<typeof documentos.$inferSelect, "arquivoBase64">;
export type LicitacaoRow = typeof licitacoes.$inferSelect;

const CATEGORIAS = ["juridico", "fiscal", "tecnico", "propostas", "editais"] as const;

export function DocumentosClient({
  documentos: documentosIniciais,
  licitacoes,
}: {
  documentos: DocumentoRow[];
  licitacoes: LicitacaoRow[];
}) {
  const [docs, setDocs] = useState(documentosIniciais);
  const [activeCategory, setActiveCategory] = useState<string>("todos");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reanalyzingId, setReanalyzingId] = useState<string | null>(null);

  const categorias = useMemo(() => {
    return [
      { key: "todos", label: "Todos", count: docs.length },
      ...CATEGORIAS.map((key) => ({
        key,
        label: CATEGORIA_META[key].label,
        count: docs.filter((d) => d.categoria === key).length,
      })),
    ];
  }, [docs]);

  const filteredDocs =
    activeCategory === "todos"
      ? docs
      : docs.filter((d) => d.categoria === activeCategory);

  const vencendoCount = docs.filter((d) => d.status === "vencendo").length;
  const vencidoCount = docs.filter((d) => d.status === "vencido").length;
  const hasAlerts = vencendoCount + vencidoCount > 0;

  let alertSubtitle = "";
  if (vencidoCount > 0 && vencendoCount > 0) {
    alertSubtitle = `${vencidoCount} vencido(s) e ${vencendoCount} vencendo nos próximos 30 dias.`;
  } else if (vencidoCount > 0) {
    alertSubtitle = `${vencidoCount} documento(s) vencido(s) — regularize antes de enviar novas propostas.`;
  } else if (vencendoCount > 0) {
    alertSubtitle = `${vencendoCount} documento(s) vencendo nos próximos 30 dias.`;
  }

  const handleUploaded = (doc: DocumentoRow) => {
    setDocs((d) => [doc, ...d]);
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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="text-[27px] font-extrabold tracking-tight">
            Documentos
          </h1>
          <p className="mt-1.5 max-w-[560px] text-[14.5px] text-muted-foreground">
            Centralize a documentação da empresa. A IA verifica validade,
            aponta pendências e compara com as exigências de cada edital.
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>+ Enviar documento</Button>
      </div>

      {hasAlerts && (
        <div className="flex items-center gap-3.5 rounded-xl border border-[#F0D89B] bg-[#FCF1DC] px-5 py-3.5">
          <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#C77C1E]" />
          <div className="flex-1 text-[13.5px] leading-relaxed text-[#7A5416]">
            <strong>
              {vencidoCount + vencendoCount} documento(s) precisam de atenção
            </strong>{" "}
            — {alertSubtitle}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {categorias.map((cat) => (
          <PillToggle
            key={cat.key}
            active={cat.key === activeCategory}
            onClick={() => setActiveCategory(cat.key)}
          >
            <span className="inline-flex items-center gap-1.5">
              {cat.label}
              <span
                className={
                  cat.key === activeCategory
                    ? "rounded-full bg-white/25 px-2 py-0.5 text-[11.5px] font-bold"
                    : "rounded-full bg-accent px-2 py-0.5 text-[11.5px] font-bold text-muted-foreground"
                }
              >
                {cat.count}
              </span>
            </span>
          </PillToggle>
        ))}
      </div>

      {filteredDocs.length === 0 ? (
        <div className="py-10 text-center text-[13.5px] text-muted-foreground">
          Nenhum documento nesta categoria ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDocs.map((doc) => {
            const cat = CATEGORIA_META[doc.categoria];
            const status = STATUS_META[doc.status];
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedId(doc.id)}
                className="flex cursor-pointer flex-col gap-3 rounded-[14px] border border-border bg-white p-4.5 shadow-sm transition-shadow hover:border-[#C9D4F5] hover:shadow-[0_6px_16px_rgba(47,95,222,0.10)]"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-[12.5px] font-extrabold text-white"
                    style={{ background: cat.color }}
                  >
                    {cat.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14.5px] font-bold leading-tight">
                      {doc.nome}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {cat.label}
                      {doc.numeroIdentificacao ? ` · ${doc.numeroIdentificacao}` : ""}
                    </div>
                  </div>
                  <span
                    className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                    style={{ background: status.bg, color: status.color }}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="text-[12.5px] text-muted-foreground">
                  {formatarDiasLabel(doc.dataValidade, doc.semVencimento)}
                </div>

                {doc.aiResumo && (
                  <div className="flex gap-2 rounded-[10px] border border-[#E7E1FF] bg-[#F7F5FF] px-3 py-2.5">
                    <span className="h-fit shrink-0 rounded-md bg-[#7C5CFC] px-1.5 py-0.5 text-[9.5px] font-extrabold tracking-wide text-white">
                      IA
                    </span>
                    <p className="line-clamp-2 text-[12.5px] leading-snug text-[#4B4560]">
                      {doc.aiResumo}
                    </p>
                  </div>
                )}

                <div className="mt-0.5 flex items-center justify-between">
                  <span className="text-[12.5px] font-bold text-primary">
                    Ver detalhes →
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReanalyze(doc.id);
                    }}
                    disabled={reanalyzingId === doc.id}
                    className="cursor-pointer border-none bg-transparent p-0 text-xs font-bold text-[#7C5CFC] disabled:opacity-50"
                  >
                    {reanalyzingId === doc.id
                      ? "Reanalisando…"
                      : "Reanalisar com IA"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        licitacoes={licitacoes}
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
