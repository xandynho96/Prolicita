"use client";

import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CATEGORIA_META, STATUS_META } from "@/lib/documentos/meta";
import { formatarDiasLabel } from "@/lib/documentos/status";
import type { DocumentoRow } from "./documentos-client";

export function DocumentoSheet({
  documento,
  onOpenChange,
  onReanalyze,
  reanalyzing,
}: {
  documento: DocumentoRow | null;
  onOpenChange: (open: boolean) => void;
  onReanalyze: () => void;
  reanalyzing: boolean;
}) {
  return (
    <Sheet open={!!documento} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-[480px]">
        {documento && (
          <>
            <SheetHeader className="border-b border-border p-6">
              <div className="flex items-start gap-3 pr-8">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] text-[13px] font-extrabold text-white"
                  style={{ background: CATEGORIA_META[documento.categoria].color }}
                >
                  {CATEGORIA_META[documento.categoria].initials}
                </div>
                <div>
                  <SheetTitle className="text-[16.5px] font-extrabold leading-tight">
                    {documento.nome}
                  </SheetTitle>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {CATEGORIA_META[documento.categoria].label}
                    {documento.numeroIdentificacao
                      ? ` · ${documento.numeroIdentificacao}`
                      : ""}
                  </div>
                </div>
              </div>
              <div className="mt-3.5 flex items-center gap-2.5">
                <span
                  className="rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                  style={{
                    background: STATUS_META[documento.status].bg,
                    color: STATUS_META[documento.status].color,
                  }}
                >
                  {STATUS_META[documento.status].label}
                </span>
                <span className="text-[12.5px] text-muted-foreground">
                  {formatarDiasLabel(documento.dataValidade, documento.semVencimento)}
                </span>
              </div>
            </SheetHeader>

            <Tabs defaultValue="resumo" className="flex flex-1 flex-col gap-0 overflow-hidden">
              <TabsList
                variant="line"
                className="h-auto w-full justify-start gap-5 rounded-none border-b border-border bg-transparent px-6 py-0"
              >
                <TabsTrigger value="resumo" className="px-0 py-3">Resumo</TabsTrigger>
                <TabsTrigger value="validade" className="px-0 py-3">Validade</TabsTrigger>
                <TabsTrigger value="comparar" className="px-0 py-3">Comparar com edital</TabsTrigger>
                <TabsTrigger value="sugestoes" className="px-0 py-3">Sugestões</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-6">
                <TabsContent value="resumo" className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <div className="text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
                        Categoria
                      </div>
                      <div className="mt-1 text-[13.5px]">
                        {CATEGORIA_META[documento.categoria].label}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
                        Identificação
                      </div>
                      <div className="mt-1 text-[13.5px]">
                        {documento.numeroIdentificacao ?? "—"}
                      </div>
                    </div>
                  </div>
                  {documento.aiResumo && (
                    <div className="rounded-xl border border-[#E7E1FF] bg-[#F7F5FF] p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-md bg-[#7C5CFC] px-1.5 py-0.5 text-[9.5px] font-extrabold text-white">
                          IA
                        </span>
                        <span className="text-[12.5px] font-bold text-[#4B4560]">
                          Resumo gerado pela IA
                        </span>
                      </div>
                      <p className="text-[13.5px] leading-relaxed text-[#453F58]">
                        {documento.aiResumo}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="validade" className="flex flex-col gap-3.5">
                  <div className="rounded-xl border border-border bg-[#F9FAFB] p-4 shadow-sm">
                    <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Situação atual
                    </div>
                    <div
                      className="text-sm font-bold"
                      style={{ color: STATUS_META[documento.status].color }}
                    >
                      {STATUS_META[documento.status].label}
                    </div>
                    <div className="mt-1 text-[13px] text-muted-foreground">
                      {formatarDiasLabel(documento.dataValidade, documento.semVencimento)}
                      {documento.dataValidade
                        ? ` · Validade: ${documento.dataValidade}`
                        : ""}
                    </div>
                  </div>
                  {documento.aiPendencias.length > 0 && (
                    <div>
                      <div className="mb-2 text-[12.5px] font-bold text-destructive">
                        Pendências identificadas pela IA
                      </div>
                      {documento.aiPendencias.map((item, i) => (
                        <div
                          key={i}
                          className="mb-1.5 rounded-lg bg-[#FBE7E7] px-3 py-2.5 text-sm leading-snug text-[#7A2E2E]"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="comparar" className="flex flex-col gap-2.5">
                  {documento.aiComparacaoEdital &&
                  documento.aiComparacaoEdital.length > 0 ? (
                    <>
                      <div className="mb-0.5 text-[12.5px] text-muted-foreground">
                        Exigências comparadas pela IA com o edital vinculado:
                      </div>
                      {documento.aiComparacaoEdital.map((req, i) => (
                        <div
                          key={i}
                          className="flex gap-2.5 rounded-[10px] border border-border bg-white p-3 shadow-sm"
                        >
                          <span
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-xs font-extrabold"
                            style={{
                              background: req.atende ? "#E3F5EC" : "#FBE7E7",
                              color: req.atende ? "#12896B" : "#B23A3A",
                            }}
                          >
                            {req.atende ? "✓" : "!"}
                          </span>
                          <div>
                            <div className="text-[13px] font-semibold">
                              {req.requisito}
                            </div>
                            <div className="mt-0.5 text-[12.5px] text-muted-foreground">
                              {req.obs}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-[13.5px] text-muted-foreground">
                      Nenhum edital vinculado a este documento ainda.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="sugestoes" className="flex flex-col gap-2">
                  {documento.aiSugestoes.length > 0 ? (
                    documento.aiSugestoes.map((sug, i) => (
                      <div
                        key={i}
                        className="rounded-[10px] border border-[#E7E1FF] bg-[#F7F5FF] px-3 py-2.5 text-sm leading-relaxed text-[#453F58]"
                      >
                        {sug}
                      </div>
                    ))
                  ) : (
                    <div className="text-[13.5px] text-muted-foreground">
                      Nenhuma sugestão da IA no momento.
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>

            <div className="flex gap-2.5 border-t border-border p-4.5">
              <Button
                className="flex-1 bg-[#7C5CFC] hover:bg-[#6B4CE0]"
                onClick={onReanalyze}
                disabled={reanalyzing}
              >
                {reanalyzing ? "Reanalisando…" : "Reanalisar com IA"}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                disabled={!documento.arquivoNomeOriginal}
                onClick={() => {
                  if (!documento.arquivoNomeOriginal) {
                    toast.info("Este documento não tem arquivo original anexado.");
                    return;
                  }
                  window.open(`/api/documentos/${documento.id}/download`, "_blank");
                }}
              >
                Baixar documento
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
