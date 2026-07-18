"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIA_META } from "@/lib/documentos/meta";
import { STATUS_META } from "@/lib/documentos/meta";
import { formatarDiasLabel } from "@/lib/documentos/status";
import type { DocumentoRow, LicitacaoRow } from "./documentos-client";

type Estagio = "idle" | "uploading" | "analyzing" | "done";

export function UploadDialog({
  open,
  onOpenChange,
  licitacoes,
  onUploaded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  licitacoes: LicitacaoRow[];
  onUploaded: (doc: DocumentoRow) => void;
}) {
  const [categoria, setCategoria] = useState("juridico");
  const [licitacaoId, setLicitacaoId] = useState<string>("");
  const [estagio, setEstagio] = useState<Estagio>("idle");
  const [resultado, setResultado] = useState<DocumentoRow | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setEstagio("idle");
    setResultado(null);
    setCategoria("juridico");
    setLicitacaoId("");
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const handleFileSelected = async (file: File) => {
    setEstagio("uploading");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("categoria", categoria);
    if (licitacaoId) formData.append("licitacaoId", licitacaoId);

    setTimeout(() => setEstagio("analyzing"), 400);

    try {
      const res = await fetch("/api/documentos/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Falha ao enviar documento");
        setEstagio("idle");
        return;
      }

      setResultado(data.documento);
      setEstagio("done");
    } catch {
      toast.error("Falha ao enviar documento");
      setEstagio("idle");
    }
  };

  const confirmar = () => {
    if (resultado) onUploaded(resultado);
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Enviar documento</DialogTitle>
        </DialogHeader>

        {estagio === "idle" && (
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoria} onValueChange={(v) => setCategoria(v ?? "juridico")}>
                <SelectTrigger>
                  <SelectValue>
                    {(v: string) => CATEGORIA_META[v]?.label ?? v}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIA_META).map(([key, meta]) => (
                    <SelectItem key={key} value={key}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {licitacoes.length > 0 && (
              <div className="space-y-2">
                <Label>Vincular a uma licitação (opcional)</Label>
                <Select
                  value={licitacaoId || "none"}
                  onValueChange={(v) => setLicitacaoId(v === "none" ? "" : (v ?? ""))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhuma">
                      {(v: string) =>
                        v === "none" || !v
                          ? "Nenhuma"
                          : (licitacoes.find((l) => l.id === v)?.orgaoNome ?? v)
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {licitacoes.map((lic) => (
                      <SelectItem key={lic.id} value={lic.id}>
                        {lic.orgaoNome} — {lic.objeto.slice(0, 40)}…
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex flex-col items-center gap-2.5 rounded-xl border-2 border-dashed border-[#D5D9E0] px-5 py-8 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-accent text-xl font-extrabold text-muted-foreground">
                ↑
              </div>
              <div className="text-[13.5px] text-muted-foreground">
                Selecione um arquivo para enviar
              </div>
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                Selecionar arquivo
              </Button>
              <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                PDF, JPG ou PNG · até 10MB
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelected(file);
                }}
              />
            </div>
          </div>
        )}

        {(estagio === "uploading" || estagio === "analyzing") && (
          <div className="flex flex-col items-center gap-3.5 py-9">
            <div
              className={`h-7 w-7 animate-spin rounded-full border-[3px] ${
                estagio === "analyzing"
                  ? "border-[#E7E1FF] border-t-[#7C5CFC]"
                  : "border-[#DCE3F5] border-t-primary"
              }`}
            />
            <div className="text-[13.5px] font-semibold text-secondary-foreground">
              {estagio === "uploading"
                ? "Enviando arquivo…"
                : "IA analisando o documento…"}
            </div>
            {estagio === "analyzing" && (
              <div className="text-center text-xs text-muted-foreground">
                Extraindo tipo, número e validade, e comparando com o perfil
                da empresa
              </div>
            )}
          </div>
        )}

        {estagio === "done" && resultado && (
          <div className="flex flex-col gap-3.5">
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-[12.5px] font-extrabold text-white"
                style={{ background: CATEGORIA_META[resultado.categoria].color }}
              >
                {CATEGORIA_META[resultado.categoria].initials}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">{resultado.nome}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {CATEGORIA_META[resultado.categoria].label} ·{" "}
                  {formatarDiasLabel(resultado.dataValidade, resultado.semVencimento)}
                </div>
              </div>
              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{
                  background: STATUS_META[resultado.status].bg,
                  color: STATUS_META[resultado.status].color,
                }}
              >
                {STATUS_META[resultado.status].label}
              </span>
            </div>
            {resultado.aiResumo && (
              <div className="flex gap-2 rounded-[10px] border border-[#E7E1FF] bg-[#F7F5FF] p-3">
                <span className="h-fit shrink-0 rounded-md bg-[#7C5CFC] px-1.5 py-0.5 text-[9.5px] font-extrabold text-white">
                  IA
                </span>
                <p className="text-[13px] leading-snug text-[#4B4560]">
                  {resultado.aiResumo}
                </p>
              </div>
            )}
            <Button onClick={confirmar}>Concluir</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
