"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { licitacoes, produtosServicos, propostas } from "@/lib/db/schema";

type Proposta = typeof propostas.$inferSelect;
type Licitacao = typeof licitacoes.$inferSelect;
type Produto = typeof produtosServicos.$inferSelect;

const CAMPOS: { key: keyof Proposta; label: string; rows: number }[] = [
  { key: "apresentacaoEmpresa", label: "1. Apresentação da empresa", rows: 4 },
  { key: "objetoOfertado", label: "2. Objeto ofertado", rows: 3 },
  { key: "especificacaoTecnica", label: "3. Especificação técnica", rows: 6 },
  { key: "cronogramaImplantacao", label: "4. Cronograma de implantação", rows: 4 },
  { key: "detalhamentoValor", label: "5. Detalhamento do valor", rows: 3 },
  { key: "declaracoes", label: "6. Declarações", rows: 3 },
];

export function PropostaEditor({
  proposta,
  licitacao,
  produtosDisponiveis,
}: {
  proposta: Proposta;
  licitacao: Licitacao;
  produtosDisponiveis: Produto[];
}) {
  const [textos, setTextos] = useState<Record<string, string>>(
    Object.fromEntries(
      CAMPOS.map((c) => [c.key, (proposta[c.key] as string | null) ?? ""])
    )
  );
  const [valorTotal, setValorTotal] = useState(proposta.valorTotal ?? "");
  const [prazoValidadeDias, setPrazoValidadeDias] = useState(
    String(proposta.prazoValidadeDias)
  );
  const [prazoExecucaoDias, setPrazoExecucaoDias] = useState(
    proposta.prazoExecucaoDias ? String(proposta.prazoExecucaoDias) : ""
  );
  const [produtosSelecionados, setProdutosSelecionados] = useState<string[]>(
    proposta.produtosSelecionadosIds
  );
  const [salvando, setSalvando] = useState(false);
  const [status, setStatus] = useState(proposta.status);

  const toggleProduto = (id: string) => {
    setProdutosSelecionados((atual) =>
      atual.includes(id) ? atual.filter((p) => p !== id) : [...atual, id]
    );
  };

  const salvar = async () => {
    setSalvando(true);
    const res = await fetch(`/api/propostas/${proposta.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...textos,
        produtosSelecionadosIds: produtosSelecionados,
        valorTotal: valorTotal ? Number(valorTotal) : undefined,
        prazoValidadeDias: Number(prazoValidadeDias) || undefined,
        prazoExecucaoDias: prazoExecucaoDias
          ? Number(prazoExecucaoDias)
          : undefined,
        status,
      }),
    });
    const data = await res.json();
    setSalvando(false);
    if (!res.ok) {
      toast.error(data.error ?? "Falha ao salvar proposta");
      return;
    }
    toast.success("Proposta salva");
  };

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/propostas"
        className="w-fit text-[13px] font-bold text-muted-foreground hover:text-foreground"
      >
        ← Voltar para Propostas
      </Link>

      <div className="rounded-xl border border-[#F0D89B] bg-[#FCF1DC] px-5 py-3.5 text-[13px] leading-relaxed text-[#7A5416]">
        <strong>Rascunho gerado por IA</strong> — revise com seu setor
        jurídico/técnico antes de enviar ao órgão licitante. A Lei 14.133/21
        não define um formato único; confira as exigências específicas do
        edital.
      </div>

      <div>
        <h1 className="text-[21px] font-extrabold leading-snug">
          {licitacao.objeto}
        </h1>
        <div className="mt-1.5 text-[13px] text-muted-foreground">
          {licitacao.orgaoNome} · {licitacao.modalidade}
        </div>
      </div>

      <div className="rounded-[14px] border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5">
          {CAMPOS.map((campo) => (
            <div key={campo.key} className="space-y-2">
              <Label className="text-xs">{campo.label}</Label>
              <Textarea
                rows={campo.rows}
                value={textos[campo.key]}
                onChange={(e) =>
                  setTextos((t) => ({ ...t, [campo.key]: e.target.value }))
                }
              />
            </div>
          ))}

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Valor total (R$)</Label>
              <Input
                type="number"
                min="0"
                value={valorTotal}
                onChange={(e) => setValorTotal(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Prazo de validade (dias)</Label>
              <Input
                type="number"
                min="1"
                value={prazoValidadeDias}
                onChange={(e) => setPrazoValidadeDias(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Prazo de execução (dias)</Label>
              <Input
                type="number"
                min="1"
                value={prazoExecucaoDias}
                onChange={(e) => setPrazoExecucaoDias(e.target.value)}
              />
            </div>
          </div>

          {produtosDisponiveis.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Produtos ofertados nesta proposta</Label>
              <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
                {produtosDisponiveis.map((produto) => (
                  <label
                    key={produto.id}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    <Checkbox
                      checked={produtosSelecionados.includes(produto.id)}
                      onCheckedChange={() => toggleProduto(produto.id)}
                    />
                    <span>
                      <span className="font-semibold">{produto.nome}</span>{" "}
                      <span className="text-muted-foreground">
                        — {produto.descricaoResumida}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs">Status</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={status === "rascunho" ? "default" : "outline"}
                onClick={() => setStatus("rascunho")}
              >
                Rascunho
              </Button>
              <Button
                type="button"
                size="sm"
                variant={status === "finalizada" ? "default" : "outline"}
                onClick={() => setStatus("finalizada")}
              >
                Finalizada
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2.5">
        <Button onClick={salvar} disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </Button>
        <a href={`/api/propostas/${proposta.id}/pdf`} target="_blank" rel="noreferrer">
          <Button type="button" variant="secondary">
            Baixar PDF
          </Button>
        </a>
      </div>
    </div>
  );
}
