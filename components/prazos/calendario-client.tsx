"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PRAZO_TIPOS, PRAZO_TIPO_META } from "@/lib/oportunidades/meta";
import { dataInputParaIso, dataParaInput, formatarDataUtc } from "@/lib/format";
import type { licitacoes, oportunidades, prazos } from "@/lib/db/schema";

type PrazoRow = typeof prazos.$inferSelect;
type OportunidadeRow = typeof oportunidades.$inferSelect;
type LicitacaoRow = typeof licitacoes.$inferSelect;

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

function mesmodia(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function CalendarioClient({
  prazos: prazosIniciais,
  oportunidades,
}: {
  prazos: PrazoRow[];
  oportunidades: { oportunidade: OportunidadeRow; licitacao: LicitacaoRow }[];
}) {
  const [prazos, setPrazos] = useState(prazosIniciais);
  const [mesAtual, setMesAtual] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<PrazoRow | null>(null);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("outro");
  const [data, setData] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [concluido, setConcluido] = useState(false);
  const [oportunidadeId, setOportunidadeId] = useState<string>("nenhuma");

  const dias = useMemo(() => {
    const primeiroDiaSemana = mesAtual.getDay();
    const diasNoMes = new Date(
      mesAtual.getFullYear(),
      mesAtual.getMonth() + 1,
      0
    ).getDate();

    const celulas: (Date | null)[] = [];
    for (let i = 0; i < primeiroDiaSemana; i++) celulas.push(null);
    for (let d = 1; d <= diasNoMes; d++) {
      celulas.push(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), d));
    }
    return celulas;
  }, [mesAtual]);

  const prazosPorDia = (dia: Date) =>
    prazos.filter((p) => mesmodia(new Date(p.data), dia));

  const proximosPrazos = [...prazos]
    .filter((p) => !p.concluido)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 20);

  const abrirNovo = () => {
    setEditando(null);
    setTitulo("");
    setTipo("outro");
    setData("");
    setObservacoes("");
    setConcluido(false);
    setOportunidadeId("nenhuma");
    setDialogOpen(true);
  };

  const abrirEdicao = (prazo: PrazoRow) => {
    setEditando(prazo);
    setTitulo(prazo.titulo);
    setTipo(prazo.tipo);
    setData(dataParaInput(prazo.data));
    setObservacoes(prazo.observacoes ?? "");
    setConcluido(prazo.concluido);
    setOportunidadeId(prazo.oportunidadeId ?? "nenhuma");
    setDialogOpen(true);
  };

  const salvar = async () => {
    if (!titulo || !data) {
      toast.error("Preencha título e data");
      return;
    }

    if (editando) {
      const res = await fetch(`/api/prazos/${editando.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          tipo,
          data: dataInputParaIso(data),
          concluido,
          observacoes: observacoes || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Falha ao salvar prazo");
        return;
      }
      setPrazos((list) =>
        list.map((p) => (p.id === editando.id ? json.prazo : p))
      );
    } else {
      const res = await fetch("/api/prazos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          tipo,
          data: dataInputParaIso(data),
          observacoes: observacoes || undefined,
          oportunidadeId:
            oportunidadeId !== "nenhuma" ? oportunidadeId : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Falha ao criar prazo");
        return;
      }
      setPrazos((list) => [...list, json.prazo]);
    }

    setDialogOpen(false);
    toast.success("Prazo salvo");
  };

  const excluir = async () => {
    if (!editando) return;
    const res = await fetch(`/api/prazos/${editando.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Falha ao excluir prazo");
      return;
    }
    setPrazos((list) => list.filter((p) => p.id !== editando.id));
    setDialogOpen(false);
    toast.success("Prazo excluído");
  };

  const hoje = new Date();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="text-[27px] font-extrabold tracking-tight">Prazos</h1>
          <p className="mt-1.5 max-w-[620px] text-[14.5px] text-muted-foreground">
            Sessões, impugnações, recursos e entregas de documentação de
            todas as suas oportunidades em um só calendário.
          </p>
        </div>
        <Button onClick={abrirNovo}>+ Novo prazo</Button>
      </div>

      <div className="rounded-[14px] border border-border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setMesAtual(
                new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1)
              )
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-[15px] font-bold">
            {MESES[mesAtual.getMonth()]} {mesAtual.getFullYear()}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setMesAtual(
                new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1)
              )
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {DIAS_SEMANA.map((d, i) => (
            <div
              key={i}
              className="py-1 text-center text-[11px] font-bold text-muted-foreground"
            >
              {d}
            </div>
          ))}
          {dias.map((dia, i) => {
            if (!dia) return <div key={i} />;
            const eventosDoDia = prazosPorDia(dia);
            const isHoje = mesmodia(dia, hoje);
            return (
              <div
                key={i}
                className={`flex min-h-[64px] flex-col gap-1 rounded-lg border p-1.5 text-[12px] ${
                  isHoje ? "border-primary bg-primary/5" : "border-transparent"
                }`}
              >
                <span
                  className={`font-semibold ${isHoje ? "text-primary" : ""}`}
                >
                  {dia.getDate()}
                </span>
                <div className="flex flex-wrap gap-1">
                  {eventosDoDia.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => abrirEdicao(p)}
                      title={p.titulo}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: PRAZO_TIPO_META[p.tipo].color }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-3 text-[15px] font-extrabold">Próximos prazos</div>
        <div className="flex flex-col gap-2">
          {proximosPrazos.length === 0 && (
            <p className="text-[13.5px] text-muted-foreground">
              Nenhum prazo pendente.
            </p>
          )}
          {proximosPrazos.map((prazo) => {
            const meta = PRAZO_TIPO_META[prazo.tipo];
            const dias = Math.ceil(
              (new Date(prazo.data).getTime() - hoje.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return (
              <button
                key={prazo.id}
                onClick={() => abrirEdicao(prazo)}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white p-4 text-left shadow-sm hover:border-primary/30"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: meta.color }}
                  />
                  <div>
                    <div className="text-sm font-bold">{prazo.titulo}</div>
                    <div className="mt-0.5 text-[12px] text-muted-foreground">
                      {meta.label} ·{" "}
                      {formatarDataUtc(prazo.data)}
                    </div>
                  </div>
                </div>
                <span className="shrink-0 text-[12.5px] font-bold text-muted-foreground">
                  {dias < 0
                    ? `${Math.abs(dias)}d atrás`
                    : dias === 0
                      ? "Hoje"
                      : `em ${dias}d`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar prazo" : "Novo prazo"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3.5">
            <div className="space-y-2">
              <Label className="text-xs">Título</Label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Tipo</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v ?? "outro")}>
                  <SelectTrigger className="w-full">
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
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Data</Label>
                <Input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>
            </div>
            {!editando && oportunidades.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs">Vincular a uma oportunidade (opcional)</Label>
                <Select
                  value={oportunidadeId}
                  onValueChange={(v) => setOportunidadeId(v ?? "nenhuma")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(v: string) =>
                        v === "nenhuma"
                          ? "Nenhuma"
                          : (oportunidades.find((o) => o.oportunidade.id === v)
                              ?.licitacao.orgaoNome ?? v)
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhuma">Nenhuma</SelectItem>
                    {oportunidades.map((o) => (
                      <SelectItem key={o.oportunidade.id} value={o.oportunidade.id}>
                        {o.licitacao.orgaoNome} — {o.licitacao.objeto.slice(0, 30)}…
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-xs">Observações</Label>
              <Textarea
                rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>
            {editando && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="concluido"
                  checked={concluido}
                  onCheckedChange={(v) => setConcluido(v === true)}
                />
                <Label htmlFor="concluido" className="font-normal">
                  Concluído
                </Label>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={salvar} className="flex-1">
                Salvar
              </Button>
              {editando && (
                <Button variant="destructive" onClick={excluir}>
                  Excluir
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
