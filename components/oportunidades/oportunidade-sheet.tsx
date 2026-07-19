"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dataInputParaIso, formatarDataUtc, formatarValor } from "@/lib/format";
import { ETAPAS, ETAPA_META, type Etapa } from "@/lib/oportunidades/meta";
import { PRAZO_TIPOS, PRAZO_TIPO_META } from "@/lib/oportunidades/meta";
import type { LicitacaoRow, MatchRow, OportunidadeRow, PrazoRow } from "./kanban-board";

interface Item {
  oportunidade: OportunidadeRow;
  licitacao: LicitacaoRow;
  match: MatchRow | null;
}

export function OportunidadeSheet({
  item,
  prazos,
  onOpenChange,
  onUpdated,
  onPrazoCriado,
}: {
  item: Item | null;
  prazos: PrazoRow[];
  onOpenChange: (open: boolean) => void;
  onUpdated: (oportunidade: OportunidadeRow) => void;
  onPrazoCriado: (prazo: PrazoRow) => void;
}) {
  return (
    <Sheet open={!!item} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-[480px]">
        {item && (
          <OportunidadeSheetContent
            key={item.oportunidade.id}
            item={item}
            prazos={prazos}
            onUpdated={onUpdated}
            onPrazoCriado={onPrazoCriado}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function OportunidadeSheetContent({
  item,
  prazos,
  onUpdated,
  onPrazoCriado,
}: {
  item: Item;
  prazos: PrazoRow[];
  onUpdated: (oportunidade: OportunidadeRow) => void;
  onPrazoCriado: (prazo: PrazoRow) => void;
}) {
  const { oportunidade, licitacao } = item;
  const router = useRouter();

  const [etapa, setEtapa] = useState(oportunidade.etapa);
  const etapaMeta = ETAPA_META[etapa];
  const [responsavel, setResponsavel] = useState(oportunidade.responsavel ?? "");
  const [valorProposta, setValorProposta] = useState(
    oportunidade.valorProposta ?? ""
  );
  const [observacoes, setObservacoes] = useState(oportunidade.observacoes ?? "");
  const [saving, setSaving] = useState(false);
  const [gerandoProposta, setGerandoProposta] = useState(false);
  const [novoPrazoOpen, setNovoPrazoOpen] = useState(false);
  const [prazoTitulo, setPrazoTitulo] = useState("");
  const [prazoTipo, setPrazoTipo] = useState<string>("outro");
  const [prazoData, setPrazoData] = useState("");

  const salvar = async () => {
    setSaving(true);
    const res = await fetch(`/api/oportunidades/${oportunidade.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        etapa,
        responsavel: responsavel || undefined,
        valorProposta: valorProposta ? Number(valorProposta) : undefined,
        observacoes: observacoes || undefined,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      toast.error(data.error ?? "Falha ao salvar");
      return;
    }
    onUpdated(data.oportunidade);
    toast.success("Oportunidade atualizada");
  };

  const gerarProposta = async () => {
    setGerandoProposta(true);
    const res = await fetch("/api/propostas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licitacaoId: licitacao.id }),
    });
    const data = await res.json();
    setGerandoProposta(false);
    if (!res.ok) {
      toast.error(data.error ?? "Falha ao gerar proposta");
      return;
    }
    router.push(`/propostas/${data.proposta.id}`);
  };

  const criarPrazo = async () => {
    if (!prazoTitulo || !prazoData) {
      toast.error("Preencha título e data do prazo");
      return;
    }
    const res = await fetch("/api/prazos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: prazoTitulo,
        tipo: prazoTipo,
        data: dataInputParaIso(prazoData),
        oportunidadeId: oportunidade.id,
        licitacaoId: licitacao.id,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Falha ao criar prazo");
      return;
    }
    onPrazoCriado(data.prazo);
    setPrazoTitulo("");
    setPrazoData("");
    setNovoPrazoOpen(false);
    toast.success("Prazo adicionado");
  };

  return (
    <>
      <SheetHeader className="border-b border-border p-6">
        <SheetTitle className="pr-8 text-[16.5px] font-extrabold leading-snug">
          {licitacao.objeto}
        </SheetTitle>
        <div className="mt-1.5 text-[12.5px] text-muted-foreground">
          {licitacao.orgaoNome} · {licitacao.modalidade}
        </div>
        <div className="mt-3 flex items-center gap-2.5">
          <span
            className="rounded-full px-2.5 py-1 text-[11.5px] font-bold"
            style={{ background: `${etapaMeta.color}1A`, color: etapaMeta.color }}
          >
            {etapaMeta.label}
          </span>
          <span className="text-[13px] font-bold">
            {formatarValor(licitacao.valorEstimado)}
          </span>
        </div>
        <div className="mt-2 flex gap-3.5">
          {licitacao.linkPortal && (
            <a
              href={licitacao.linkPortal}
              target="_blank"
              rel="noreferrer"
              className="text-[12.5px] font-bold text-primary hover:underline"
            >
              Ver no portal ↗
            </a>
          )}
          {licitacao.linkEdital && (
            <a
              href={licitacao.linkEdital}
              target="_blank"
              rel="noreferrer"
              className="text-[12.5px] font-bold text-primary hover:underline"
            >
              Ver edital ↗
            </a>
          )}
        </div>
      </SheetHeader>

      <div className="flex flex-col gap-4 p-6">
        <div className="space-y-2">
          <Label className="text-xs">Etapa</Label>
          <Select value={etapa} onValueChange={(v) => setEtapa((v as Etapa) ?? etapa)}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {(v: string) => ETAPA_META[v as Etapa]?.label ?? v}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ETAPAS.map((e) => (
                <SelectItem key={e} value={e}>
                  {ETAPA_META[e].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Responsável</Label>
          <Input
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            placeholder="Nome do responsável"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Valor da proposta (R$)</Label>
          <Input
            type="number"
            min="0"
            value={valorProposta}
            onChange={(e) => setValorProposta(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Observações</Label>
          <Textarea
            rows={3}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={salvar} disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
          {etapa !== "identificada" && (
            <Button
              type="button"
              variant="secondary"
              onClick={gerarProposta}
              disabled={gerandoProposta}
            >
              {gerandoProposta ? "Gerando..." : "Gerar proposta"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border p-6">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold">Prazos</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNovoPrazoOpen((v) => !v)}
          >
            + Adicionar prazo
          </Button>
        </div>

        {novoPrazoOpen && (
          <div className="flex flex-col gap-2.5 rounded-lg border border-border p-3">
            <Input
              placeholder="Título do prazo"
              value={prazoTitulo}
              onChange={(e) => setPrazoTitulo(e.target.value)}
            />
            <div className="flex gap-2">
              <Select value={prazoTipo} onValueChange={(v) => setPrazoTipo(v ?? "outro")}>
                <SelectTrigger className="flex-1">
                  <SelectValue>
                    {(v: string) =>
                      PRAZO_TIPO_META[v as keyof typeof PRAZO_TIPO_META]?.label ?? v
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PRAZO_TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {PRAZO_TIPO_META[t].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                className="flex-1"
                value={prazoData}
                onChange={(e) => setPrazoData(e.target.value)}
              />
            </div>
            <Button size="sm" onClick={criarPrazo}>
              Salvar prazo
            </Button>
          </div>
        )}

        {prazos.length === 0 && !novoPrazoOpen && (
          <p className="text-[13px] text-muted-foreground">
            Nenhum prazo cadastrado para esta oportunidade.
          </p>
        )}
        {prazos.map((prazo) => {
          const meta = PRAZO_TIPO_META[prazo.tipo];
          return (
            <div
              key={prazo.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border p-3"
            >
              <div>
                <div className="text-[13px] font-semibold">{prazo.titulo}</div>
                <div className="mt-0.5 text-[11.5px]" style={{ color: meta.color }}>
                  {meta.label} · {formatarDataUtc(prazo.data)}
                </div>
              </div>
              {prazo.concluido && (
                <span className="rounded-full bg-[#E3F5EC] px-2 py-0.5 text-[10.5px] font-bold text-[#12896B]">
                  Concluído
                </span>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
